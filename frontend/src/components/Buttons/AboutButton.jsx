import { useNavigate, useLocation } from "react-router-dom";
import { gsap } from "gsap";
import "./AboutButton.scss";

export default function AboutButton({ screenRef }) {
  const navigate = useNavigate();
  const location = useLocation();

  function handleClick() {
    if (location.pathname !== "/about") {
      if (screenRef?.current) {
        gsap.to(screenRef.current, {
          opacity: 0,
          duration: 0.45,
          ease: "power2.inOut"
        });
      }
      navigate("/about");
    }
  }

  return (
    <button
      className="about-button"
      onClick={handleClick}
      aria-label="À propos"
    >
      ?
    </button>
  );
}
