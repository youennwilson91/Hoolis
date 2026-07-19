import useStore from "../../utils/store";
import { useRef, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import SEOHead from "../../components/SEOHead";
import StructuredData, { createOrganizationSchema } from "../../components/StructuredData";
import "./Hoolis.scss";
import HoolisMobile from "./HoolisMobile";
import HoolisDesktop from "./HoolisDesktop";
import PaymentReturn from "../../components/PaymentReturn";

export default function Hoolis() {
  const screenRef = useRef(null);
  const labelRef = useRef(null);

  // State local pour isMobile
  const [isMobile, setIsMobile] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  // Capturé une seule fois au montage : l'id présent dans l'URL au chargement
  const [initialProductId] = useState(() => {
    const id = searchParams.get('produit');
    return id ? Number(id) : null;
  });

  // Sélecteurs individuels
  const setLabel = useStore(state => state.setLabel);
  const setLabelColor = useStore(state => state.setLabelColor);
  const bgColor = useStore(state => state.bgColor);
  const setIsClicked = useStore(state => state.setIsClicked);
  const hoolisProducts = useStore(state => state.hoolisProducts);
  const selectedArticleId = useStore(state => state.selectedArticleId);

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
    // setIsClicked, setLabel, setLabelColor sont des fonctions stables de Zustand
    // bgColor est uniquement utilisé pour initialiser setLabelColor au mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Synchronise l'URL avec le produit ouvert (partage/SEO), sans ajouter d'entrée d'historique par clic
  useEffect(() => {
    const current = searchParams.get('produit');
    const next = selectedArticleId != null ? String(selectedArticleId) : null;
    if (current === next) return;

    const params = new URLSearchParams(searchParams);
    if (next) {
      params.set('produit', next);
    } else {
      params.delete('produit');
    }
    setSearchParams(params, { replace: true });
    // searchParams change à chaque navigation ; seul selectedArticleId doit déclencher cet effet
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedArticleId]);

  const openProduct = hoolisProducts?.find(p => p.id === selectedArticleId);

  return (
    <>
      {openProduct ? (
        <SEOHead
          title={`${openProduct.title} - Maison Hoolis`}
          description={openProduct.description || "Découvrez ce produit de la collection exclusive Hoolis."}
          image={openProduct.images?.[0]?.image}
          url={`https://www.maisonhoolis.com/?produit=${openProduct.id}`}
        />
      ) : (
        <SEOHead
          title="Maison Hoolis - Vêtements & Maroquinerie"
          description="Découvrez la collection exclusive Hoolis : vêtements haut de gamme, maroquinerie de luxe et accessoires de prestige. Mode française d'exception."
          keywords="maison hoolis, vêtements de luxe, maroquinerie haut de gamme, mode française, luxe parisien, accessoires de prestige"
          url="https://www.maisonhoolis.com/"
        />
      )}
      <StructuredData data={createOrganizationSchema()} />
      
      {isMobile ? (
        <HoolisMobile labelRef={labelRef} initialProductId={initialProductId} />
      ) : (
        <HoolisDesktop screenRef={screenRef} labelRef={labelRef} initialProductId={initialProductId} />
      )}
      
      {/* Composant pour gérer le retour de paiement Stripe */}
      <PaymentReturn />
    </>
  );
}
