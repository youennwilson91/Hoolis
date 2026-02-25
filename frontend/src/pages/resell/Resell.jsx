import useStore from "../../utils/store";
import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import SEOHead from "../../components/SEOHead";
import StructuredData, { createOrganizationSchema } from "../../components/StructuredData";
import "../hoolis/Hoolis.scss";
import ResellMobile from "./ResellMobile";
import ResellDesktop from "./ResellDesktop";
import PaymentReturn from "../../components/PaymentReturn";

export default function Resell() {
  const screenRef = useRef(null);
  const labelRef = useRef(null);

  // State local pour isMobile
  const [isMobile, setIsMobile] = useState(false);

  // Sélecteurs individuels
  const setLabel = useStore(state => state.setLabel);
  const setLabelColor = useStore(state => state.setLabelColor);
  const bgColor = useStore(state => state.bgColor);
  const setIsClicked = useStore(state => state.setIsClicked);

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
  }, [bgColor, setIsClicked, setLabel, setLabelColor]);


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
        title="Maison Hoolis - Vêtements & Maroquinerie"
        description="Découvrez la collection exclusive Hoolis : vêtements haut de gamme, maroquinerie de luxe et accessoires de prestige. Mode française d'exception."
        keywords="maison hoolis, vêtements de luxe, maroquinerie haut de gamme, mode française, luxe parisien, accessoires de prestige"
        url="https://maisonhoolis.com/hoolis"
      />
      <StructuredData data={createOrganizationSchema()} />
      
      {isMobile ? (
        <ResellMobile labelRef={labelRef} />
      ) : (
        <ResellDesktop screenRef={screenRef} labelRef={labelRef} />
      )}
      
      {/* Composant pour gérer le retour de paiement Stripe */}
      <PaymentReturn />
    </>
  );
}
