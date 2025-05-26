import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import "./Calendar.scss";
import useStore from '../utils/store';

function BookingCalendar() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [formattedDate, setFormattedDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [name, setName] = useState("");
  const [watch, setWatch] = useState("Montre 1");
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const { isBooking, setIsBooking, host_address, port } = useStore();

  useEffect(() => {
    if (isSuccess) {
      setName("");
      setEmail("");
    }
  }, [isSuccess]);

  // Quand la date est modifiée, on formate et on stocke
  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      setFormattedDate(`${year}-${month}-${day}`);
    } else {
      setFormattedDate("");
    }
  };

  // Lorsqu'une date formatée est disponible, on interroge l'API
  useEffect(() => {
    if (formattedDate) {
      fetchAvailableSlots(formattedDate);
    }
  }, [formattedDate]);

  const fetchAvailableSlots = async (date) => {
    try {
      const formattedDate = new Date(date).toISOString().split('T')[0];
      
      const response = await axios.get(`http://${host_address}:${port}/store/available_slots/?date=${formattedDate}`);
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
    
    axios.post(`http://${host_address}:${port}/store/bookings/`, {
      name: name,
      watch: watch,
      date: formattedDate,
      start_time: slot.start_time,
      end_time: slot.end_time
    }).then(() => {
      setIsSuccess(true);
      setSlots(slots.filter(s => s.start_time !== slot.start_time)); // retirer le créneau réservé
      sendConfirmationEmail(name, email, watch, formattedDate, slot.start_time, slot.end_time);
    }).catch(err => {
      console.log("Données envoyées:", {
        name, watch, date: formattedDate, 
        start_time: slot.start_time, end_time: slot.end_time
      });
      console.error("Erreur détaillée:", err.response ? err.response.data : err);
      alert("Ce créneau est déjà pris ou une erreur est survenue.");
    });
  };

  function sendConfirmationEmail(name, email, watch, date, start_time, end_time) {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('_subject', 'Confirmation de votre réservation chez Franc and Watch');
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
          <select
            value={watch}
            onChange={(e) => setWatch(e.target.value)}
            className="form-input"
          >
            <option value="watch1">Montre 1</option>
            <option value="watch2">Montre 2</option>
            <option value="watch3">Montre 3</option>
          </select>
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
