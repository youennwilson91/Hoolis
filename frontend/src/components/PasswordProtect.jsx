import { useState } from 'react';
import './PasswordProtect.scss';
import { API_BASE_URL } from '../utils/axiosConfig';

const PasswordProtect = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      } else {
        setError('Mot de passe incorrect');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  // Vérifier si déjà authentifié localement
  if (localStorage.getItem('hoolis_access') === 'true' && !isAuthenticated) {
    setIsAuthenticated(true);
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