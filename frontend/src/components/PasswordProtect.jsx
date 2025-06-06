import { useState, useEffect } from 'react';
import './PasswordProtect.scss';

const PasswordProtect = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [serverStatus, setServerStatus] = useState({
    isConnected: null, // null = checking, true = connected, false = disconnected
    message: 'Vérification de la connexion...'
  });

  // Configuration de l'URL de l'API basée sur l'environnement
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    const checkAuthStatus = async () => {
      // Vérifier si déjà authentifié localement
      const hasLocalAccess = localStorage.getItem('hoolis_access');
      
      if (hasLocalAccess === 'true') {
        setIsAuthenticated(true);
        setIsLoading(false);
        setServerStatus({
          isConnected: true,
          message: 'Connecté au serveur'
        });
        return;
      }

      // Vérifier la session Django
      try {
        const response = await fetch(`${API_BASE_URL}/api/check-access/`, {
          method: 'GET',
          credentials: 'include', // Important pour les cookies de session
        });

        if (response.ok) {
          const data = await response.json();
          setServerStatus({
            isConnected: true,
            message: 'Serveur connecté'
          });
          if (data.has_access) {
            localStorage.setItem('hoolis_access', 'true');
            setIsAuthenticated(true);
          }
        } else {
          setServerStatus({
            isConnected: false,
            message: `Serveur inaccessible (${response.status})`
          });
        }
      } catch (err) {
        console.log('Erreur lors de la vérification de la session:', err);
        setServerStatus({
          isConnected: false,
          message: 'Impossible de contacter le serveur'
        });
      }

      setIsLoading(false);
    };

    checkAuthStatus();
  }, [API_BASE_URL]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Appel API au backend Django pour vérifier le mot de passe
      const response = await fetch(`${API_BASE_URL}/api/verify-access/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ password: password }),
      });

      if (response.ok) {
        localStorage.setItem('hoolis_access', 'true');
        setIsAuthenticated(true);
        setServerStatus({
          isConnected: true,
          message: 'Authentification réussie'
        });
      } else {
        setError('Mot de passe incorrect');
        setServerStatus({
          isConnected: true,
          message: 'Serveur connecté'
        });
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
      setServerStatus({
        isConnected: false,
        message: 'Erreur de connexion'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="password-protect loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return children;
  }

  return (
    <div className="password-protect">
      <div className="password-card">
        <div className="password-header">
          <h1>Maison Hoolis</h1>
          <p>Accès restreint</p>
        </div>

        {/* Indicateur de statut du serveur */}
        <div className={`server-status ${serverStatus.isConnected === true ? 'connected' : serverStatus.isConnected === false ? 'disconnected' : 'checking'}`}>
          <div className="status-indicator">
            <span className="status-dot"></span>
            <span className="status-text">{serverStatus.message}</span>
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
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              className={error ? 'error' : ''}
              disabled={isLoading || serverStatus.isConnected === false}
              autoFocus
            />
          </div>
          
          <button 
            type="submit" 
            className="access-button"
            disabled={isLoading || !password || serverStatus.isConnected === false}
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