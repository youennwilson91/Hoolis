import { useState } from "react";
import "./SupportPopup.scss";

export default function SupportPopup({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="support-popup-overlay" onClick={onClose}>
      <div className="support-popup-content" onClick={(e) => e.stopPropagation()}>
        <button className="support-popup-close" onClick={onClose}>
          ×
        </button>
        
        <div className="support-popup-header">
          <h2>Support & Contact</h2>
          <p>Une question ? Un problème avec votre commande ? Contactez-nous !</p>
        </div>
        
        <form className="support-popup-form" action="https://formsubmit.co/youson91@hotmail.fr" method="POST">
          <input 
            type="email" 
            name="email" 
            placeholder="Votre email" 
            required 
          />
          <input 
            type="text" 
            name="code" 
            placeholder="Numéro de commande" 
            required 
          />
          <input 
            type="text" 
            name="subject" 
            placeholder="Sujet" 
            required 
          />
          <textarea 
            name="message" 
            placeholder="Votre message" 
            required
            rows="4"
          ></textarea>
          <button type="submit">Envoyer</button>
        </form>
      </div>
    </div>
  );
} 