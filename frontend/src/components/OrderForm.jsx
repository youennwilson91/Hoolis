import { useState } from "react";
import { sanitizeImageUrl, sanitizeAltText } from "../utils/sanitizer";
import "./OrderForm.scss";
import { apiClient } from "../utils/axiosConfig";

export default function OrderForm({
  item,
  isOpen,
  onClose
}) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'France'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  function handleFormChange(field, value) {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }

  function resetForm() {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      country: 'France'
    });
  }

  function handleClose() {
    resetForm();
    onClose();
  };

  async function handleClientInfoSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (import.meta.env.DEV) {
        console.log('Création de la session Stripe...');
        console.log('Données item:', item);
        console.log('Données customer:', formData);
      }

      // Validation côté frontend
      if (!item || !item.name || item.name.trim() === '') {
        if (import.meta.env.DEV) {
          console.error('Nom de l\'article manquant:', item);
        }
        setError('Nom de l\'article manquant');
        setIsLoading(false);
        return;
      }

      if (item.price === undefined || item.price === null) {
        if (import.meta.env.DEV) {
          console.error('Prix de l\'article manquant:', item);
        }
        setError('Prix de l\'article manquant');
        setIsLoading(false);
        return;
      }
      
      // Créer la session Stripe (l'email sera envoyé après paiement confirmé)
      let stripeResponse;
      
      if (item.isCart || item.cartItems) {
        // Pour un panier : envoyer directement les items à Stripe
        stripeResponse = await apiClient.post('/store/create-stripe-session/', {
          items: item.cartItems.map(cartItem => ({
            product_id: cartItem.id,
            quantity: cartItem.quantity || 1
          })),
          customer: formData
        });
      } else {
        // Pour un article unique : envoyer comme un item
        stripeResponse = await apiClient.post('/store/create-stripe-session/', {
          items: [{
            product_id: item.id,
            quantity: 1
          }],
          customer: formData
        });
      }

      if (import.meta.env.DEV) {
        console.log('Session Stripe créée:', stripeResponse.data);
      }

      // Rediriger vers Stripe Checkout
      if (stripeResponse.data.checkout_url) {
        // Rediriger vers Stripe (le formulaire reste ouvert pendant la redirection)
        window.location.href = stripeResponse.data.checkout_url;
      } else {
        if (import.meta.env.DEV) {
          console.error('URL de checkout manquante');
        }
        setError('Erreur lors de la redirection vers le paiement');
        setIsLoading(false);
      }

    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Erreur lors du processus de commande:', error);
      }
      setIsLoading(false);

      // Afficher un message d'erreur plus spécifique
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('Erreur lors de la création du paiement. Veuillez réessayer.');
      }
    }
  }

  if (!isOpen || !item) return null;

  return (
    <div className="order-popup-overlay" onClick={handleClose}>
      <div className="order-popup" onClick={(e) => e.stopPropagation()}>
        <div className="order-popup-header">
          <h2>
            {isLoading && <span className="header-spinner"></span>}
            {isLoading ? 'Redirection vers le paiement...' : 'Finaliser votre commande'}
          </h2>
          <button className="close-popup-btn" onClick={handleClose} disabled={isLoading}>×</button>
        </div>
        
        <div className="order-popup-content">
          {/* Récapitulatif de la montre */}
          <div className="order-summary">
                      <div className="order-item-info">

            <div className="order-item-details">
              <h3>{item?.name || 'Article'}</h3>
              </div>
            </div>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div style={{
              padding: '12px',
              marginBottom: '16px',
              backgroundColor: 'rgba(255, 0, 0, 0.1)',
              border: '1px solid red',
              borderRadius: '4px',
              color: 'red'
            }}>
              {error}
            </div>
          )}

          {/* Formulaire client */}
          <form className="order-form" onSubmit={handleClientInfoSubmit}>
            <div className="form-section">
              <h4>Informations personnelles</h4>
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="firstName">Prénom *</label>
                  <input
                    type="text"
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleFormChange('firstName', e.target.value)}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="lastName">Nom *</label>
                  <input
                    type="text"
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleFormChange('lastName', e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleFormChange('email', e.target.value)}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="phone">Téléphone *</label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleFormChange('phone', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4>Adresse de livraison</h4>
              <div className="form-field">
                <label htmlFor="address">Adresse *</label>
                <input
                  type="text"
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleFormChange('address', e.target.value)}
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="city">Ville *</label>
                  <input
                    type="text"
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleFormChange('city', e.target.value)}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="postalCode">Code postal *</label>
                  <input
                    type="text"
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => handleFormChange('postalCode', e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="form-field">
                <label htmlFor="country">Pays *</label>
                <select
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleFormChange('country', e.target.value)}
                  required
                >
                  <option value="France">France</option>
                  <option value="Belgique">Belgique</option>
                  <option value="Suisse">Suisse</option>
                  <option value="Luxembourg">Luxembourg</option>
                </select>
              </div>
            </div>

            <div className="order-form-actions">
              <button type="button" className="cancel-btn" onClick={handleClose} disabled={isLoading}>
                ANNULER
              </button>
              <button type="submit" className={`validate-btn ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
                {isLoading ? 'CHARGEMENT...' : `PASSER AU PAIEMENT${item?.price ? ` - ${item.price}€` : ''}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}