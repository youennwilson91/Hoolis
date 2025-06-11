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
          setIsAuthenticated(true);
        } catch (error) {
          // Token invalide, on le supprime
          try {
            const response = await apiClient.post(API_ENDPOINTS.jwtRefresh, {
              refresh: refreshToken
            });
            localStorage.setItem('hoolis_token_access', response.data.access);
            localStorage.setItem('hoolis_token_refresh', response.data.refresh);
            setIsAuthenticated(true);
          } catch (error) {
            console.error('Erreur lors de la suppression des tokens:', error);
            localStorage.removeItem('hoolis_token_access');
            localStorage.removeItem('hoolis_token_refresh');
          }
        }
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
      const response = await apiClient.post(API_ENDPOINTS.jwtCreate, {
        username: username,
        password: password
      });

      // Sauvegarder les tokens
      localStorage.setItem('hoolis_token_access', response.data.access);
      localStorage.setItem('hoolis_token_refresh', response.data.refresh);
      setIsAuthenticated(true);
      
    } catch (error) {
      if (error.response?.status === 401) {
        setError('Nom d\'utilisateur ou mot de passe incorrect');
      } else {
        setError('Erreur de connexion au serveur');
      }
    } finally {
      setIsLoading(false);
    }
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
        
        <div className="password-footer">
          <p>Veuillez entrer le mot de passe pour accéder au site</p>
        </div>
      </div>
    </div>
  );
};

export default PasswordProtect; 