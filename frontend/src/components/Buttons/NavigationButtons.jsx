import { useLocation } from "react-router-dom";
import "./NavigationButtons.scss";
import useStore from "../../utils/store.jsx";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";

export default function NavigationButtons({ screenRef, homeTo, image, label }) {
  const location = useLocation();
  const navigation = useNavigate();
  const isClicked = useStore(state => state.isClicked);
  const setBgColor = useStore(state => state.setBgColor);
  const setLabelColor = useStore(state => state.setLabelColor);
  const setLabel = useStore(state => state.setLabel);
  const setIsClicked = useStore(state => state.setIsClicked);

  function handleHover() {
    if (!isClicked) {
      setBgColor("#000000");
      setLabel(label);
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
    if (location.pathname !== homeTo) {
      setIsClicked(true);  // Bloque les interactions pendant la transition

      gsap.to(screenRef.current, {
        opacity: 0,
        duration: 0.45,
        ease: "power2.inOut"
      });

      navigation(homeTo);
      
    }
  }

  return (
    <button 
      className="hoolis-fw-floating-button"
      onClick={handleClick}
      onMouseEnter={handleHover}
      onMouseLeave={handleHoverOut}
    >
      <img src={image} alt="logo" loading="lazy" />
    </button>
  );
} 