import MenuButtons from "../../components/Buttons/Menu.jsx";
import SupportButton from "../../components/Buttons/SupportButton.jsx";
import useStore from "../../utils/store.jsx";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import SEOHead from "../../components/SEOHead.jsx";
import StructuredData, { createOrganizationSchema } from "../../components/StructuredData.jsx";
import "./Gallery.scss";
import "../../index.css";

export default function Gallery() {
  const screenRef = useRef(null);
  const mobileScreenRef = useRef(null);
  const labelRef = useRef(null);
  const { label, setLabel, bgColor, labelColor, setLabelColor, setIsClicked, mobileButtonsVisible, setMobileButtonsVisible} = useStore();

  useEffect(() => {
    setIsClicked(false);
    setLabel("");
    setLabelColor("bgColor");
    setMobileButtonsVisible(false);
  }, []);

  useGSAP(() => {
    gsap.to(screenRef.current, {
      duration: 0.35,
      ease: "power3.inOut",
      opacity: 1
    });
  }, []);

  useGSAP(() => {
    gsap.to(mobileScreenRef.current, {
      duration: 0.35,
      ease: "power3.inOut",
      opacity: 1
    });
  }, []);

  return (
    <>
      <SEOHead
        title="Galerie Hoolis - Collections & Créations de Luxe"
        description="Découvrez la galerie exclusive Hoolis : aperçu de nos créations, collections de vêtements haut de gamme et pièces d'exception. Inspiration mode luxe."
        keywords="galerie hoolis, créations luxe, collections mode, vêtements haut de gamme, inspiration mode, luxe français"
        url="https://maisonhoolis.com/gallery"
      />
      <StructuredData data={createOrganizationSchema()} />
    
    <div ref={screenRef} className="hoolis-container" style={{backgroundColor: bgColor}}>
      <h1 ref={labelRef} className="title-label" style={{color: labelColor}}>{label}</h1>
      <MenuButtons screenRef={screenRef} />
      <div className="hoolis-images-container">
        <img 
          src="/hoolis-img/mouth-tee-thomas.jpg" 
          alt="T-shirt Mouth Tee Hoolis - Collection Exclusive - Vue Portée Face" 
          loading="lazy" 
        />
        <img 
          src="/hoolis-img/mouth-tee-back.jpg" 
          alt="T-shirt Mouth Tee Hoolis - Collection Exclusive - Vue Portée Dos" 
          loading="lazy" 
        />
        <img 
          src="/hoolis-img/coquillage-tee-polito.jpg" 
          alt="T-shirt Coquillage Hoolis - Collection Exclusive - Vue Détaillée" 
          loading="lazy" 
        />
      </div>
    </div>
    <SupportButton />
    </>

  );
}
