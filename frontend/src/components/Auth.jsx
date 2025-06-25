import React, { useState } from 'react';
import { apiClient, API_BASE_URL } from '../utils/axiosConfig';
import './Auth.scss';
import { sanitizeError } from '../utils/sanitizer';

const Auth = ({ onAuthSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fonction de gestion d'erreur sécurisée
  const handleError = (error) => {
    let statusCode = null;
    if (error.response) {
      statusCode = error.response.status;
    }
    const sanitizedError = sanitizeError(error.message || "Erreur d'authentification", statusCode);
    setError(sanitizedError);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/auth/jwt/create/', {
        username,
        password
      });

      const { access, refresh } = response.data;
      
      // Stocker les tokens
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      // Notifier le parent du succès
      onAuthSuccess(access);
      
      console.log('✅ Connexion réussie');
      
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Accès Hoolis</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Nom d'utilisateur"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          
          <button 
            type="submit" 
            disabled={loading || !username || !password}
            className="login-button"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth; 