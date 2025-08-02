import { useState } from "react";
import { sanitizeImageUrl, sanitizeAltText } from "../utils/sanitizer";
import "./OrderForm.scss";
import { apiClient } from "../utils/axiosConfig";

export default function OrderForm({ 
  watch, 
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
    
    try {
      console.log('Création de la session Stripe...');
      
      // Debug: vérifier les données avant envoi
      console.log('Données watch:', watch);
      console.log('Données customer:', formData);
      
      // Validation côté frontend
      if (!watch || !watch.name || watch.name.trim() === '') {
        console.error('Nom de la montre manquant:', watch);
        alert('Erreur: Nom de la montre manquant');
        onClose();
        return;
      }
      
      if (watch.price === undefined || watch.price === null) {
        console.error('Prix de la montre manquant:', watch);
        alert('Erreur: Prix de la montre manquant');
        onClose();
        return;
      }
      
      // Créer la session Stripe (l'email sera envoyé après paiement confirmé)
      const stripeResponse = await apiClient.post('/store/create-stripe-session/', {
        watch_id: watch.id,
        customer: formData
      });
      
      console.log('Session Stripe créée:', stripeResponse.data);
      
      // Rediriger vers Stripe Checkout
      if (stripeResponse.data.checkout_url) {
        // Fermer le formulaire avant la redirection
        onClose();
        // Rediriger vers Stripe
        window.location.href = stripeResponse.data.checkout_url;
      } else {
        console.error('URL de checkout manquante');
        alert('Erreur lors de la redirection vers le paiement');
        onClose();
      }
      
    } catch (error) {
      console.error('Erreur lors du processus de commande:', error);
      
      // Afficher un message d'erreur plus spécifique
      if (error.response?.data?.error) {
        alert(`Erreur: ${error.response.data.error}`);
      } else if (error.message) {
        alert(`Erreur: ${error.message}`);
      } else {
        alert('Erreur lors de la création du paiement');
      }
      
      // En cas d'erreur, fermer le formulaire aussi
      onClose();
    }
  }

  if (!isOpen) return null;

  return (
    <div className="order-popup-overlay" onClick={handleClose}>
      <div className="order-popup" onClick={(e) => e.stopPropagation()}>
        <div className="order-popup-header">
          <h2>Finaliser votre commande</h2>
          <button className="close-popup-btn" onClick={handleClose}>×</button>
        </div>
        
        <div className="order-popup-content">
          {/* Récapitulatif de la montre */}
          <div className="order-summary">
            <div className="order-watch-info">
              {watch.wide && watch.wide[0] && (
                <img 
                  src={sanitizeImageUrl(watch.wide[0].media)} 
                  alt={sanitizeAltText(watch.name)}
                  className="order-watch-image"
                />
              )}
              <div className="order-watch-details">
                <h3>{watch.name}</h3>
              </div>
            </div>
          </div>

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
              <button type="button" className="cancel-btn" onClick={handleClose}>
                ANNULER
              </button>
              <button type="submit" className="validate-btn">
                PASSER AU PAIEMENT - {watch.price}€
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}