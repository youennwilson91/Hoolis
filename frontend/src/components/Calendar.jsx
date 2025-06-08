import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import './Calendar.scss';
import { apiClient, API_ENDPOINTS } from "../utils/axiosConfig";
import useStore from "../utils/store";
import { useLocation } from 'react-router-dom';

const BookingCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [formattedDate, setFormattedDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedWatch, setSelectedWatch] = useState("");
  const [availableWatches, setAvailableWatches] = useState([]);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { isBooking, setIsBooking, products, watches, medias } = useStore();

  const location = useLocation();

  const apiAvailableSlots = 
    location.pathname.includes('/fw') 
    ? API_ENDPOINTS.availableSlots : API_ENDPOINTS.availableSlotsProducts;
  const apiBookings = 
    location.pathname.includes('/fw') 
    ? API_ENDPOINTS.bookings : API_ENDPOINTS.bookingsProducts;

  const isShopPage = location.pathname.includes('/shop') || location.pathname.includes('/hoolis');

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
      setEmail("");
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
    }
  };

  // Réserver un créneau
  const handleBooking = (slot) => {
    if (!name) return alert("Entrez votre nom avant de réserver !");
    if (!email) return alert("Entrez votre email avant de réserver !");
    if (!selectedWatch) return alert("Veuillez sélectionner un article !");
    
    console.log(selectedWatch);
    apiClient.post(apiBookings, {
      name: name,
      watch: selectedWatch,
      date: formattedDate,
      start_time: slot.start_time,
      end_time: slot.end_time
    }).then(() => {
      setIsSuccess(true);
      setSlots(slots.filter(s => s.start_time !== slot.start_time)); // retirer le créneau réservé
      sendConfirmationEmail(name, email, selectedWatch, formattedDate, slot.start_time, slot.end_time);
    }).catch(err => {
      console.log("Données envoyées:", {
        name, watch: selectedWatch, date: formattedDate, 
        start_time: slot.start_time, end_time: slot.end_time
      });
      console.error("Erreur détaillée:", err.response ? err.response.data : err);
      alert("Ce créneau est déjà pris ou une erreur est survenue.");
    });
  };

  function sendConfirmationEmail(name, email, watch, date, start_time, end_time) {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('_subject', 'Confirmation de votre réservation chez Franck and Watch');
    formData.append('message', `Bonjour ${name},\n\nVotre réservation pour la ${watch} est confirmée le ${date} de ${start_time} à ${end_time}.\n\nMerci d'avoir choisi nos services.\n\nL'équipe Franc and Watch`);
    
    fetch(`https://formsubmit.co/${email}`, {
      method: 'POST',
      body: formData
    })
    .then(response => console.log('Email envoyé avec succès'))
    .catch(error => console.error('Erreur lors de l\'envoi de l\'email:', error));
  }

  return (
    <div className="booking-calendar">
      {!isSuccess && (
        <>
          <input
            type="text"
            placeholder="Votre nom"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-input"
          />
          <input
            type="email"
            placeholder="Votre email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input"
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
                  <option key={product.id} value={product.title}>{product.title}</option>
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
                <option key={watch.id} value={watch.name}>{watch.name}</option>
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
                {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
                <button 
                  onClick={() => handleBooking(slot)}
                  className="booking-button"
                >
                  Réserver
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
      {isSuccess && 
        <div className="success-message">
          <p>Réservation confirmée !</p>
          <p>Vous recevrez un email de confirmation.</p>
        </div>
      }
      <button 
        onClick={() => setIsBooking(false)}
        className="close-booking-button"
      >
        X
      </button>
    </div>
  );
}

export default BookingCalendar;
