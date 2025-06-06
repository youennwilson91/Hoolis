import axios from 'axios';

// Configuration API centralisée
const API_BASE_URL = 'https://hoolis.onrender.com' || 'http://localhost:8000';

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
  checkAccess: '/api/check-access/',
  verifyAccess: '/api/verify-access/',
};

// Configuration par défaut d'axios pour tout le projet
axios.defaults.withCredentials = true;

// Intercepteur pour ajouter automatiquement les credentials à toutes les requêtes
axios.interceptors.request.use(
  (config) => {
    // S'assurer que les credentials sont toujours inclus
    config.withCredentials = true;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Gestion centralisée des erreurs
    if (error.response?.status === 403) {
      console.log('Accès refusé - vérification des permissions nécessaire');
    } else if (error.response?.status === 401) {
      console.log('Non autorisé - authentification requise');
    }
    return Promise.reject(error);
  }
);

export default axios; 