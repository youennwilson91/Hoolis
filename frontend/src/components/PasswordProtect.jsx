import { useState, useEffect } from 'react';
import './PasswordProtect.scss';

const PasswordProtect = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      // Vérifier si déjà authentifié localement
      const hasLocalAccess = localStorage.getItem('hoolis_access');
      
      if (hasLocalAccess === 'true') {
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }

      // Vérifier la session Django
      try {
        const response = await fetch('http://localhost:8000/api/check-access/', {
          method: 'GET',
          credentials: 'include', // Important pour les cookies de session
        });

        if (response.ok) {
          const data = await response.json();
          if (data.has_access) {
            localStorage.setItem('hoolis_access', 'true');
            setIsAuthenticated(true);
          }
        }
      } catch (err) {
        console.log('Erreur lors de la vérification de la session:', err);
      }

      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Appel API au backend Django pour vérifier le mot de passe
      const response = await fetch('http://localhost:8000/api/verify-access/', {
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
      } else {
        setError('Mot de passe incorrect');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
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
              disabled={isLoading}
              autoFocus
            />
          </div>
          
          <button 
            type="submit" 
            className="access-button"
            disabled={isLoading || !password}
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