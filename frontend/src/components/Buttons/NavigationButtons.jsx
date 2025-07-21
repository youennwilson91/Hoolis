import { useLocation } from "react-router-dom";
import "./NavigationButtons.scss";
import useStore from "../../utils/store.jsx";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";

export default function NavigationButtons({ screenRef, homeTo, image, label }) {
  const location = useLocation();
  const navigation = useNavigate();
  const {isClicked, setBgColor, setLabelColor, setLabel, setIsClicked } = useStore();
  const [destination, setDestination] = useState("/hoolis"); // Valeur par défaut
  const [buttonLabel, setButtonLabel] = useState("MaisonHoolis");
  
  useEffect(() => {
      // Page par défaut (landing)
      setButtonLabel(label);
      setDestination(homeTo);
  }, [location.pathname]);

  function handleHover() {
    if (!isClicked) {
      setBgColor("#000000");
      setLabel(buttonLabel);
      setLabelColor("#EFEC8F");
    }
  }

  function handleHoverOut() {
    if (!isClicked) {
      setLabel("");
      setBgColor("#000000");
      setLabelColor("#000000");
    }
  }
  
  function handleClick() {
    if (location.pathname !== destination) {
      setIsClicked(true);  // Bloque les interactions pendant la transition
      
      gsap.to(screenRef.current, {
        opacity: 0,
        duration: 0.45,
        ease: "power2.inOut"
      });
      
      navigation(destination);
      
    }
  }

  return (
    <button 
      className="hoolis-fw-floating-button"
      onClick={handleClick}
      onMouseEnter={handleHover}
      onMouseLeave={handleHoverOut}
    >
      {/* <span className="hoolis-fw-button-text">{buttonLabel}</span> */}
      <img src={image} alt="logo" />
    </button>
  );
} 