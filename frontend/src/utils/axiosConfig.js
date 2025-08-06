import axios from 'axios';

// Configuration axios pour l'API Django
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://hoolis-backend.onrender.com'
  : 'http://localhost:8000';

// Instance axios configurée
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
});

// Endpoints API centralisés
export const API_ENDPOINTS = {
  watches: '/store/watches/',
  products: '/store/products/',
  availableSlots: '/store/available-slots-watches/',
  bookings: '/store/bookings-watches/',
  availableSlotsProducts: '/store/available-slots-products/',
  bookingsProducts: '/store/bookings-products/',
  collections: '/store/collections/',
  verifyAccess: '/api/verify-access/',
  // Endpoints JWT
  jwtCreate: '/auth/jwt/create/',
  jwtRefresh: '/auth/jwt/refresh/',
  jwtVerify: '/auth/jwt/verify/',
  // Endpoints pour la commande
  sendConfirmationCode: '/store/send-confirmation-code/',
  verifyConfirmationCode: '/store/verify-confirmation-code/',
  cancelVerification: '/store/cancel-verification/',
};

// Fonction pour obtenir le token d'accès
const getAccessToken = () => {
  return localStorage.getItem('hoolis_token_access');
};

// Fonction pour obtenir le token de rafraîchissement
const getRefreshToken = () => {
  return localStorage.getItem('hoolis_token_refresh');
};

// Fonction pour sauvegarder les tokens
const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem('hoolis_token_access', accessToken);
  if (refreshToken) {
    localStorage.setItem('hoolis_token_refresh', refreshToken);
  }
};

// Fonction pour supprimer les tokens
const clearTokens = () => {
  localStorage.removeItem('hoolis_token_access');
  localStorage.removeItem('hoolis_token_refresh');
};

// Fonction pour rafraîchir le token
const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await axios.post(
      `${API_BASE_URL}${API_ENDPOINTS.jwtRefresh}`,
      { refresh: refreshToken }
    );
    
    const { access, refresh: newRefresh } = response.data;
    setTokens(access, newRefresh || refreshToken);
    return access;
  } catch (error) {
    clearTokens();
    throw error;
  }
};

// Configuration par défaut d'axios pour tout le projet
axios.defaults.withCredentials = true;

// Intercepteur pour ajouter automatiquement le token JWT à toutes les requêtes
apiClient.interceptors.request.use(
  (config) => {
    // S'assurer que les credentials sont toujours inclus
    config.withCredentials = true;
    
    // Ajouter le token JWT si disponible
    const accessToken = getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Si c'est une erreur 401, vérifier le contexte de la requête
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      
      console.log('❌ Erreur 401 détectée pour:', requestUrl);
      
      // Si c'est une tentative de connexion initiale, ne pas recharger la page
      if (requestUrl.includes('/auth/jwt/create/')) {
        console.log('❌ Erreur de connexion - identifiants incorrects');
        return Promise.reject(error);
      }
      
      // Si c'est une vérification de token ou un rafraîchissement, ne pas recharger
      if (requestUrl.includes('/auth/jwt/verify/') || requestUrl.includes('/auth/jwt/refresh/')) {
        console.log('❌ Erreur de vérification/rafraîchissement de token');
        return Promise.reject(error);
      }
      
      // Pour les autres requêtes avec un token invalide, nettoyer et laisser PasswordProtect gérer
      console.log('❌ Token invalide pour une requête protégée, nettoyage des tokens');
      clearTokens();
      
      // Ne pas recharger automatiquement la page, laisser PasswordProtect gérer l'état
      // window.location.reload(); // Commenté pour éviter les rechargements automatiques
    }
    
    return Promise.reject(error);
  }
);

export default axios; 