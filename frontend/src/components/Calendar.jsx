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

  const { isBooking, setIsBooking } = useStore();

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
      axios.get(`http://localhost:8000/store/available_slots/?date=${formattedDate}`)
        .then((res) => {
          console.log(res.data);
          // La réponse est paginée, les créneaux sont dans results
          setSlots(res.data);
        });
    }
  }, [formattedDate]);

  // Réserver un créneau
  const handleBooking = (slot) => {
    if (!name) return alert("Entrez votre nom avant de réserver !");
    
    axios.post('http://localhost:8000/store/bookings/', {
      name: name,
      watch: watch,
      date: formattedDate,
      start_time: slot.start_time,
      end_time: slot.end_time
    }).then(() => {
      alert("Réservation confirmée !");
      setSlots(slots.filter(s => s.start_time !== slot.start_time)); // retirer le créneau réservé
    }).catch(err => {
      console.log("Données envoyées:", {
        name, watch, date: formattedDate, 
        start_time: slot.start_time, end_time: slot.end_time
      });
      console.error("Erreur détaillée:", err.response ? err.response.data : err);
      alert("Ce créneau est déjà pris ou une erreur est survenue.");
    });
  };

  return (
    <div className="booking-calendar">
      <input
        type="text"
        placeholder="Votre nom"
        value={name}
        onChange={(e) => setName(e.target.value)}
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
            {new Date(`${slot.date}T${slot.start_time}`).toLocaleTimeString()} – {new Date(`${slot.date}T${slot.end_time}`).toLocaleTimeString()}
            <button 
              onClick={() => handleBooking(slot)}
              className="booking-button"
            >
              Réserver
            </button>
          </li>
        ))}
      </ul>
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
