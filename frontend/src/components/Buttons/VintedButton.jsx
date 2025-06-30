import { useLocation } from "react-router-dom";
import "./VintedButton.scss";

export default function VintedButton() {
  const location = useLocation();

  const getVintedUrl = () => {
    if (location.pathname === "/hoolis" || location.pathname === "/hoolis/") {
      return "https://www.vinted.fr/member/203917586"; // maisonhoolis
    } else if (location.pathname === "/fw" || location.pathname === "/fw/") {
      return "https://www.vinted.fr/member/247122575"; // franckandwatch
    }
    return "https://www.vinted.fr/member/203917586"; // default
  };

  const handleClick = () => {
    window.open(getVintedUrl(), '_blank', 'noopener,noreferrer');
  };

  return (
    <button 
      className="vinted-floating-button"
      onClick={handleClick}
      aria-label="Voir nos articles sur Vinted"
    >
      <span className="vinted-button-text">Vinted</span>
    </button>
  );
} 