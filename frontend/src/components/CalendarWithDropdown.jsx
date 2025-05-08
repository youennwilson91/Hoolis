import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Calendar.scss';

function BookingCalendarWithDropdown() {
  const [selectedDate, setSelectedDate] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const [slots, setSlots] = useState([]);
  const [name, setName] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [showForm, setShowForm] = useState(true);

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
      fetchSlots(new Date(selectedDate));
    }
  }, [selectedDate]);

  // Fetch available slots for the selected date
  const fetchSlots = async (date) => {
    try {
      const selectedDate = date.toISOString().split('T')[0];
      const response = await axios.get(`http://192.168.1.184:8000/api/available_slots/?date=${selectedDate}`);
      setSlots(response.data || []);
    } catch (error) {
      console.error('Error fetching slots:', error);
      setSlots([]);
    }
  };

  // Function to handle the booking
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post('http://192.168.1.184:8000/api/bookings/', {
        date: selectedDate.toISOString().split('T')[0],
        time_slot: selectedTimeSlot,
        name: clientName,
        email: clientEmail,
      });
      
      setBookingSuccess(true);
      setShowForm(false);
    } catch (error) {
      console.error('Error creating booking:', error);
      // You can handle error states here
    }
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
      <input
        type="email"
        placeholder="Votre email"
        value={clientEmail}
        onChange={(e) => setClientEmail(e.target.value)}
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
              onClick={() => handleBookingSubmit(event)}
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