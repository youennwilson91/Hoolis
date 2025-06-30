import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import useStore from "../utils/store";
import SEOHead from "../components/SEOHead";
import StructuredData, { createOrganizationSchema } from "../components/StructuredData";
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
      setIsMobile(window.innerWidth <= 1300);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  useGSAP(() => {
    if (!isMobile && screenRef.current) {
      gsap.to(screenRef.current, {
        backgroundColor: "#000000",
        duration: 0.75,
        ease: "power3.inOut",
        opacity: 1
      });
    }
  }, [isMobile]);

  return (
    <>
      <SEOHead
        title="Frank & Watch - Montres de Luxe & Horlogerie | Hoolis"
        description="Collection exclusive de montres de prestige Frank & Watch. Horlogerie suisse et française, pièces d'exception, service de réparation et entretien professionnel."
        keywords="frank and watch, montres de luxe, horlogerie, montres suisses, montres françaises, réparation montres, entretien montres, hoolis"
        url="https://hoolis.com/fw"
      />
      <StructuredData data={createOrganizationSchema()} />
      
      {isMobile ? (
        <FandWMobile labelRef={labelRef} />
      ) : (
        <FandWDesktop screenRef={screenRef} labelRef={labelRef} />
      )}
    </>
  );
}
