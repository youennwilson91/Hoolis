import Button from "../components/NavButtons";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import useStore from "../utils/store";
import "./FandW.scss";
import FandWMobile from "./FandWMobile";
import FandWDesktop from "./FandWDesktop";

export default function FandW() {
  const screenRef = useRef(null);
  const labelRef = useRef(null);
  const { 
    label, setLabel, 
    bgColor, 
    labelColor, setLabelColor, 
    setIsClicked,
    isMobile,
    setIsMobile
  } = useStore();

  useEffect(() => {
    setIsClicked(false);
    setLabel("");
    setLabelColor(bgColor);
    
    // Vérifier la taille de l'écran au chargement
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 900);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  useGSAP(() => {
    gsap.to(screenRef.current, {
      backgroundColor: "#000000",
      duration: 0.75,
      ease: "power3.inOut",
      opacity: 1
    });
  }, []);

  return (
    <>
      {isMobile ? (
        <FandWMobile labelRef={labelRef} />
      ) : (
        <FandWDesktop screenRef={screenRef} labelRef={labelRef} />
      )}
    </>
  );
}
