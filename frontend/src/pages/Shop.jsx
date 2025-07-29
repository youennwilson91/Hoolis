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
    setIsMobile,
    addToCart,
    setAddToCart
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

  // Fonctions pour gérer le panier
  function handleAddToCart(article, e) {
    e.stopPropagation();
    console.log("Adding to cart:", article);
    setAddToCart(prevCart => {
      const newCart = [...prevCart, {...article, cartid: Date.now() + Math.random()}];
      console.log("Cart updated:", newCart);
      return newCart;
    });
    alert("Article ajouté au panier");
  }

  function handleRemoveItem(item) {
    console.log("Removing from cart:", item);
    setAddToCart(prevCart => prevCart.filter(
      cartItem => cartItem.cartid !== item.cartid
    ));
  }

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
        <ShopMobile 
          labelRef={labelRef} 
          handleAddToCart={handleAddToCart}
          handleRemoveItem={handleRemoveItem}
        />
      ) : (
        <ShopDesktop screenRef={screenRef} labelRef={labelRef} />
      )}
    </>
  );
}
