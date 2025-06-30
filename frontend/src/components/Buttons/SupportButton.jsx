import { useState } from "react";
import SupportPopup from "../SupportPopup.jsx";
import "./SupportButton.scss";

export default function SupportButton() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  return (
    <>
      <button 
        className="support-floating-button"
        onClick={togglePopup}
        aria-label="Ouvrir le support"
      >
      Contact      
      </button>
      
      <SupportPopup 
        isOpen={isPopupOpen} 
        onClose={() => setIsPopupOpen(false)} 
      />
    </>
  );
} 