import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import './Calendar.scss';
import { apiClient, API_ENDPOINTS } from "../utils/axiosConfig";
import useStore from "../utils/store";
import { useLocation } from 'react-router-dom';
import { sanitizeError, sanitizeText } from '../utils/sanitizer';

function BookingCalendar({ type }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [formattedDate, setFormattedDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [selectedWatch, setSelectedWatch] = useState("");
  const [availableWatches, setAvailableWatches] = useState([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [verificationStep, setVerificationStep] = useState('form');
  const [verificationCode, setVerificationCode] = useState("");
  const [requestId, setRequestId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  const { isBooking, setIsBooking, products, watches, medias } = useStore();

  const location = useLocation();

  const apiAvailableSlots = 
    location.pathname.includes('/fw') 
    ? API_ENDPOINTS.availableSlots : API_ENDPOINTS.availableSlotsProducts;
  const apiBookings = 
    location.pathname.includes('/fw') 
    ? API_ENDPOINTS.bookings : API_ENDPOINTS.bookingsProducts;

  const isShopPage = location.pathname.includes('/shop') || location.pathname.includes('/hoolis');

  // Fonction pour afficher les erreurs de manière sécurisée
  const showError = (error, statusCode = null) => {
    const sanitizedError = sanitizeError(error, statusCode);
    setErrorMessage(sanitizedError);
    // Effacer le message après 5 secondes
    setTimeout(() => setErrorMessage(""), 5000);
  };

  // Fonction utilitaire pour formater une date en YYYY-MM-DD
  function formatDate(date) {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };



  // Initialise la valeur par défaut selon la page

  // Formater la date initiale au chargement du composant
  useEffect(() => {
    if (selectedDate && !formattedDate) {
      setFormattedDate(formatDate(selectedDate));
    }
  }, [selectedDate, formattedDate]);

  useEffect(() => {
    if (isSuccess) {
      setName("");
      setPhone("");
      setSelectedWatch("");
      setVerificationCode("");
    }
  }, [isSuccess]);

  // Quand la date est modifiée, on formate et on stocke
  const handleDateChange = (date) => {
    setSelectedDate(date);
    setFormattedDate(formatDate(date));
  };

  // Lorsqu'une date formatée est disponible, on interroge l'API
  useEffect(() => {
    if (formattedDate) {
      fetchAvailableSlots(formattedDate);
    }
  }, [formattedDate]);

  const fetchAvailableSlots = async (date) => {
    try {
      // Le paramètre 'date' est déjà formaté en YYYY-MM-DD
      const response = await apiClient.get(`${apiAvailableSlots}?date=${date}`);
      console.log('API response:', response.data);
      const slotsArray = response.data.results || [];
      setSlots(slotsArray);
    } catch (error) {
      console.error('Erreur lors de la récupération des créneaux:', error);
      setSlots([]);
      showError(error.response?.data?.error || "Erreur de chargement des créneaux", error.response?.status);
    }
  };

  // Étape 1 : Envoyer le code de vérification SMS
  function handleSendVerification(slot) {
    if (!name || !phone || !selectedWatch) {
      showError("Veuillez remplir tous les champs");
      return;
    }
    
    // Formater le numéro au format international
    const internationalPhone = phone.startsWith('0') ? `+33${phone.substring(1)}` : phone;

    // Envoyer le code de vérification
    apiClient.post(API_ENDPOINTS.sendConfirmationCode, {
      email: email,
      name: name,
      type: type, 
      phone: internationalPhone,
      date: formattedDate,
      start_time: slot.start_time,
      end_time: slot.end_time
    }).then(response => {
      console.log('Code SMS envoyé:', response.data);
      setVerificationStep('verify');
      setRequestId(response.data.request_id);
      console.log('Request ID:', response.data.request_id);
      // Stocker le slot pour l'utiliser après vérification
      setSelectedSlot(slot);
      setErrorMessage(""); // Effacer les erreurs précédentes
    }).catch(error => {
      console.error('Erreur lors de l\'envoi du code:', error);
      console.error('Réponse du serveur:', error.response?.data);
      
      // Affichage d'erreur sécurisé
      const statusCode = error.response?.status;
      let errorText = error.response?.data?.error || error.response?.data?.detail || error.message;
      showError(errorText, statusCode);
    });
  }

  // Étape 2 : Vérifier le code et faire la réservation
  function handleVerifyAndBook() {
    if (!verificationCode || verificationCode.length < 4) {
      showError("Entrez le code à 4 chiffres reçu par email");
      return;
    }
    
    // Vérifier le code SMS avec votre endpoint
    apiClient.post(API_ENDPOINTS.verifyConfirmationCode, {
      code: verificationCode,
      email: email,
      date: formattedDate,
      start_time: selectedSlot.start_time,
      end_time: selectedSlot.end_time,
      name: name,
      type: type,
      phone: phone,
      watch: selectedWatch
    })
    .then(() => {
      setIsSuccess(true);
      setVerificationStep('success');
      setSlots(slots.filter(s => s.start_time !== selectedSlot.start_time));
      setErrorMessage(""); // Effacer les erreurs

    })
    .catch(err => {
      console.error("Erreur lors de la vérification ou réservation:", err);
      const statusCode = err.response?.status;
      let errorText = err.response?.data?.detail || err.response?.data?.error || err.message;
      showError(errorText, statusCode);
    });
  }



  return (
    <div className="booking-calendar">
      {/* Affichage des erreurs sécurisé */}
      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}

      {/* Formulaire initial */}
      {verificationStep === 'form' && (
        <>
          <input
            type="text"
            placeholder="Votre nom"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-input"
            maxLength="50" // Limiter la longueur
          />
          <input
            type="email"
            placeholder="Votre email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input"
            maxLength="50" // Limiter la longueur
          />
          <input
            type="tel"
            placeholder="Votre téléphone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="form-input"
            maxLength="15" // Limiter la longueur
          />
          {isShopPage ? (
            <select
              value={selectedWatch || ""}
              onChange={(e) => setSelectedWatch(e.target.value)}
              className="form-input"
            >
              <option value="">Sélectionnez un article</option>
              {products.length === 0 ? (
                <option value="" disabled>Chargement des produits...</option>
              ) : (
                products.map((product) => (
                  <option key={product.id} value={sanitizeText(product.title)}>
                    {sanitizeText(product.title)}
                  </option>
                ))
              )}
            </select>
          ) : (
            <select
              value={selectedWatch || ""}
              onChange={(e) => setSelectedWatch(e.target.value)}
              className="form-input"
            >
              <option value="">Sélectionnez un article</option>
              {watches.map((watch) => (
                <option key={watch.id} value={sanitizeText(watch.name)}>
                  {sanitizeText(watch.name)}
                </option>
              ))}
            </select>
          )}
          <br /><br />
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            dateFormat="yyyy-MM-dd"
            placeholderText="Choisissez une date"
            showPopperArrow={true}
            className="dropdown-datepicker"
            calendarClassName="dropdown-calendar"
            popperClassName="dropdown-popper"
            popperPlacement="bottom-start"
            dropdownMode="select"
          />
          <br /><br />
          {slots.length === 0 && selectedDate && <p>Aucun créneau disponible.</p>}
          <ul className="slots-list">
            {slots.map((slot, index) => (
              <li key={index} className="slot-item">
                <span className="slot-time">
                  {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
                </span>
                <button 
                  onClick={() => handleSendVerification(slot)}
                  className="booking-button"
                >
                  Réserver
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Vérification du code SMS */}
      {verificationStep === 'verify' && (
        <div className="verification-step">
          <h3>Vérification</h3>
          <p>Nous avons envoyé un code à 4 chiffres à {sanitizeText(email)}</p>
          <input
            type="text"
            placeholder="Code de vérification"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            className="form-input"
            maxLength="6"
          />
          <button 
            onClick={handleVerifyAndBook}
            className="booking-button"
          >
            Vérifier
          </button>
          <button 
            onClick={() => setVerificationStep('form')}
            className="back-button"
          >
            Retour
          </button>
        </div>
      )}
      
      {/* Étape 3: Succès */}
      {verificationStep === 'success' && 
        <div className="success-message">
          <p>Réservation confirmée pour le {formattedDate} à {selectedSlot.start_time.slice(0, 5)} - {selectedSlot.end_time.slice(0, 5)}</p>
          <p>Vous recevrez une confirmation par email.</p>
          <p>Vous pouvez fermer cette fenêtre.</p>
        </div>
      }
      
      <button 
        onClick={() => setIsBooking(false)}
        className="close-booking-button"
      >
        Fermer
      </button>
    </div>
  );
}

export default BookingCalendar;
