import Button from "../components/NavButtons";
import useStore from "../utils/store";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import "./Shop.scss";
import ShopMobile from "./ShopMobile";
import ShopDesktop from "./ShopDesktop";

export default function Shop() {
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
        <ShopMobile labelRef={labelRef} />
      ) : (
        <ShopDesktop screenRef={screenRef} labelRef={labelRef} />
      )}
    </>
  );
}
