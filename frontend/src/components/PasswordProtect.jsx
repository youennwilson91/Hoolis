import { useState, useEffect } from 'react';
import './PasswordProtect.scss';
import { apiClient, API_ENDPOINTS, API_BASE_URL } from '../utils/axiosConfig';
import axios from 'axios';

const PasswordProtect = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [serverStatus, setServerStatus] = useState('checking'); // 'online', 'offline', 'checking'

  // Fonction pour nettoyer les tokens corrompus
  const clearTokens = () => {
    localStorage.removeItem('hoolis_token_access');
    localStorage.removeItem('hoolis_token_refresh');
    // Aussi nettoyer les anciens tokens s'ils existent
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  };

  // Vérifier le statut du serveur
  const checkServerStatus = async () => {
    try {
      // Créer une instance axios simple sans intercepteurs pour éviter le reload automatique
      const simpleAxios = axios.create({
        baseURL: API_BASE_URL,
      });
      
      await simpleAxios.post(API_ENDPOINTS.jwtVerify, { token: 'test' });
      setServerStatus('online');
      return true;
    } 
    
    catch (error) {
      if (error.response) {
        setServerStatus('online');
        return true; 
      } 
      
      else {
        console.error('Serveur inaccessible:', error);
        setServerStatus('offline');
        return false; 
      }
    }
  };

  // Vérifier si l'utilisateur est déjà authentifié au chargement
  useEffect(() => {
    const checkExistingAuth = async () => {
      
      const isServerOnline = await checkServerStatus();
      
      if (!isServerOnline) {
        setIsCheckingAuth(false);
        return;
      }
      
      const refreshToken = localStorage.getItem('hoolis_token_refresh');
      const accessToken = localStorage.getItem('hoolis_token_access');

      if (accessToken) {
        try {
          const response = await apiClient.post(API_ENDPOINTS.jwtVerify, {
            token: accessToken
          });
          console.log('✅ Token valide, authentification réussie');
          setIsAuthenticated(true);
        } catch (error) {
          console.log('❌ Token invalide, tentative de rafraîchissement...');
          // Token invalide, tenter de le rafraîchir
          if (refreshToken) {
            try {
              const response = await apiClient.post(API_ENDPOINTS.jwtRefresh, {
                refresh: refreshToken
              });
              localStorage.setItem('hoolis_token_access', response.data.access);
              if (response.data.refresh) {
                localStorage.setItem('hoolis_token_refresh', response.data.refresh);
              }
              console.log('✅ Token rafraîchi avec succès');
              setIsAuthenticated(true);
            } catch (refreshError) {
              console.log('❌ Impossible de rafraîchir le token, nettoyage...');
              clearTokens();
            }
          } else {
            console.log('❌ Pas de refresh token, nettoyage...');
            clearTokens();
          }
        }
      } else {
        console.log('ℹ️ Aucun token trouvé');
      }
      
      setIsCheckingAuth(false);
    };

    checkExistingAuth();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('🔐 Tentative de connexion...');
      const response = await apiClient.post(API_ENDPOINTS.jwtCreate, {
        username: username,
        password: password
      });

      // Sauvegarder les tokens
      localStorage.setItem('hoolis_token_access', response.data.access);
      localStorage.setItem('hoolis_token_refresh', response.data.refresh);
      console.log('✅ Connexion réussie, tokens sauvegardés');
      setIsAuthenticated(true);
      
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
      if (error.response?.status === 401) {
        setError('Nom d\'utilisateur ou mot de passe incorrect');
      } else {
        setError('Erreur de connexion au serveur');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour forcer la déconnexion (utile pour déboguer)
  const handleForceLogout = () => {
    console.log('🔄 Déconnexion forcée...');
    clearTokens();
    setIsAuthenticated(false);
    setError('');
  };

  // Affichage pendant la vérification de l'authentification
  if (isCheckingAuth) {
    return (
      <div className="password-protect">
        <div className="password-card">
          <div className="password-header">
            <h1>Maison Hoolis</h1>
            <p>Vérification...</p>
          </div>
        </div>
      </div>
    );
  }

  // Si authentifié, afficher le contenu protégé
  if (isAuthenticated) {
    return children;
  }

  // Sinon, afficher le formulaire de connexion
  return (
    <div className="password-protect">
      <div className="password-card">
        <div className="password-header">
          <h1>Maison Hoolis</h1>
          <p>Accès restreint</p>
          <div className="server-status">
            <p className={`server-${serverStatus}`}>
              {serverStatus === 'online' && 'Serveur en ligne'}
              {serverStatus === 'offline' && 'Serveur hors ligne'}
              {serverStatus === 'checking' && 'Vérification du serveur...'}
            </p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="password-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <div className="form-group">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nom d'utilisateur"
              className={error ? 'error' : ''}
              disabled={isLoading}
              autoFocus
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              className={error ? 'error' : ''}
              disabled={isLoading}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="access-button"
            disabled={isLoading || !username || !password}
          >
            {isLoading ? 'Vérification...' : 'Entrer'}
          </button>
        </form>
        
        {/* Bouton de debug pour nettoyer les tokens corrompus */}
        <div className="debug-actions" style={{ marginTop: '20px', textAlign: 'center' }}>
          <button 
            type="button"
            onClick={handleForceLogout}
            style={{ 
              background: 'transparent', 
              border: '1px solid #ccc', 
              color: '#666',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            Nettoyer les données de connexion
          </button>
        </div>
        
        <div className="password-footer">
          <p>Veuillez entrer le mot de passe pour accéder au site</p>
        </div>
      </div>
    </div>
  );
};

export default PasswordProtect; 