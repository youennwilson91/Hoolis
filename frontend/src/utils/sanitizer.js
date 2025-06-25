import DOMPurify from 'dompurify';

/**
 * Utilitaires de sanitisation pour éviter les XSS
 */

// Configuration sécurisée de DOMPurify
const sanitizerConfig = {
  ALLOWED_TAGS: [], // Aucun tag HTML autorisé par défaut
  ALLOWED_ATTR: [],
  ALLOW_DATA_ATTR: false,
  ALLOW_UNKNOWN_PROTOCOLS: false,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_DOM_IMPORT: false
};

/**
 * Sanitise un message d'erreur
 * @param {string} error - Le message d'erreur à sanitiser
 * @param {number} status - Le code de statut HTTP (optionnel)
 * @returns {string} - Message d'erreur sécurisé
 */
export const sanitizeError = (error, status = null) => {
  // Messages d'erreur génériques et sécurisés
  const safeErrorMessages = {
    400: "Requête invalide",
    401: "Authentification requise", 
    403: "Accès non autorisé",
    404: "Ressource non trouvée",
    409: "Conflit détecté",
    500: "Erreur serveur temporaire",
    503: "Service temporairement indisponible"
  };

  // Si on a un statut HTTP connu, retourner le message générique
  if (status && safeErrorMessages[status]) {
    return safeErrorMessages[status];
  }

  // Si l'erreur n'est pas une string, retourner un message générique
  if (typeof error !== 'string') {
    return "Une erreur est survenue";
  }

  // Limiter la longueur du message
  if (error.length > 200) {
    return "Erreur de traitement";
  }

  // Supprimer tous les tags HTML et caractères dangereux
  let cleanError = DOMPurify.sanitize(error, sanitizerConfig);
  
  // Supprimer les caractères de contrôle et scripts potentiels
  cleanError = cleanError
    .replace(/[<>'"]/g, '') // Supprimer les caractères HTML dangereux
    .replace(/javascript:/gi, '') // Supprimer les protocoles dangereux
    .replace(/on\w+=/gi, '') // Supprimer les handlers d'événements
    .trim();

  // Si après nettoyage il ne reste rien, retourner un message générique
  if (!cleanError || cleanError.length === 0) {
    return "Erreur de format";
  }

  return cleanError;
};

/**
 * Sanitise du texte pour l'affichage sécurisé
 * @param {string} text - Le texte à sanitiser
 * @param {boolean} allowBasicFormatting - Autoriser <b>, <i>, <em>, <strong>
 * @returns {string} - Texte sécurisé
 */
export const sanitizeText = (text, allowBasicFormatting = false) => {
  if (typeof text !== 'string') {
    return '';
  }

  const config = allowBasicFormatting 
    ? {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong'],
        ALLOWED_ATTR: [],
        ALLOW_DATA_ATTR: false
      }
    : sanitizerConfig;

  return DOMPurify.sanitize(text, config);
};

/**
 * Sanitise les données d'un produit/article
 * @param {object} item - L'objet produit/article
 * @returns {object} - Objet avec données sanitisées
 */
export const sanitizeProduct = (item) => {
  if (!item || typeof item !== 'object') {
    return {};
  }

  return {
    ...item,
    title: sanitizeText(item.title),
    description: sanitizeText(item.description),
    name: sanitizeText(item.name), // Pour les montres
    // Préserver les autres propriétés numériques/booléennes
    price: item.price,
    id: item.id,
    is_available: item.is_available,
    images: item.images // Les URLs d'images sont gérées séparément
  };
};

/**
 * Valide et sanitise une URL d'image
 * @param {string} url - L'URL à valider
 * @returns {string} - URL sécurisée ou URL par défaut
 */
export const sanitizeImageUrl = (url) => {
  const defaultImage = '/path/to/default/image.jpg';
  
  if (!url || typeof url !== 'string') {
    return defaultImage;
  }

  // Vérifier que l'URL commence par http/https ou est relative
  const urlPattern = /^(https?:\/\/|\/)/;
  if (!urlPattern.test(url)) {
    return defaultImage;
  }

  // Supprimer les caractères dangereux
  const cleanUrl = url.replace(/[<>"']/g, '');
  
  return cleanUrl || defaultImage;
};

/**
 * Sanitise les attributs alt des images
 * @param {string} alt - Le texte alt à sanitiser
 * @returns {string} - Texte alt sécurisé
 */
export const sanitizeAltText = (alt) => {
  if (!alt || typeof alt !== 'string') {
    return 'Image';
  }

  // Nettoyer et limiter la longueur
  const cleanAlt = sanitizeText(alt).substring(0, 100);
  return cleanAlt || 'Image';
}; 