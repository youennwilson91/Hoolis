import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Calendar.scss';

function BookingCalendarWithDropdown() {
  const [selectedDate, setSelectedDate] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const [slots, setSlots] = useState([]);
  const [name, setName] = useState("");

  // Générer des dates pour les 14 prochains jours
  useEffect(() => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      dates.push({ value: dateStr, label: formatDateForDisplay(dateStr) });
    }
    
    setAvailableDates(dates);
  }, []);

  // Formater la date pour l'affichage
  const formatDateForDisplay = (dateStr) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('fr-FR', options);
  };

  // Lorsqu'une date est sélectionnée, on interroge l'API
  useEffect(() => {
    if (selectedDate) {
      axios.get(`http://localhost:8000/api/available_slots/?date=${selectedDate}`)
        .then((res) => {
          setSlots(res.data);
        });
    }
  }, [selectedDate]);

  // Réserver un créneau
  const handleBooking = (slot) => {
    if (!name) return alert("Entrez votre nom avant de réserver !");
    axios.post('http://localhost:8000/api/bookings/', {
      name: name,
      start_time: slot.start,
      end_time: slot.end
    }).then(() => {
      alert("Réservation confirmée !");
      setSlots(slots.filter(s => s.start !== slot.start)); // retirer le créneau réservé
    }).catch(err => {
      alert("Ce créneau est déjà pris.");
    });
  };

  return (
    <div className="booking-calendar">
      <h2>Réserver un créneau</h2>
      <input
        type="text"
        placeholder="Votre nom"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="form-input"
      />
      <br /><br />
      
      <select 
        value={selectedDate} 
        onChange={(e) => setSelectedDate(e.target.value)}
        className="date-dropdown"
      >
        <option value="">Sélectionnez une date</option>
        {availableDates.map((date) => (
          <option key={date.value} value={date.value}>
            {date.label}
          </option>
        ))}
      </select>
      
      <br /><br />
      <h3>Créneaux disponibles</h3>
      {slots.length === 0 && selectedDate && <p>Aucun créneau disponible.</p>}
      <ul className="slots-list">
        {slots.map((slot, index) => (
          <li key={index} className="slot-item">
            {new Date(slot.start).toLocaleTimeString()} – {new Date(slot.end).toLocaleTimeString()}
            <button 
              onClick={() => handleBooking(slot)}
              className="booking-button"
            >
              Réserver
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BookingCalendarWithDropdown; 