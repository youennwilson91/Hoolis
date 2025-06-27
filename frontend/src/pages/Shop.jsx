import Button from "../components/NavButtons";
import useStore from "../utils/store";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import SEOHead from "../components/SEOHead";
import StructuredData, { createOrganizationSchema } from "../components/StructuredData";
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
    // Only animate screenRef if we're not in mobile mode and screenRef exists
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
        title="Collection Hoolis - Vêtements de Luxe & Maroquinerie"
        description="Découvrez la collection exclusive Hoolis : vêtements haut de gamme, maroquinerie de luxe et accessoires de prestige. Mode française d'exception."
        keywords="hoolis collection, vêtements de luxe, maroquinerie haut de gamme, mode française, luxe parisien, accessoires de prestige"
        url="https://hoolis.com/hoolis"
      />
      <StructuredData data={createOrganizationSchema()} />
      
      {isMobile ? (
        <ShopMobile labelRef={labelRef} />
      ) : (
        <ShopDesktop screenRef={screenRef} labelRef={labelRef} />
      )}
    </>
  );
}
