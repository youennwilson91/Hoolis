import MenuButtons from "../../components/Buttons/MenuMobile.jsx";
import useStore from "../../utils/store.jsx";
import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import "./Resell.scss";
import BookingCalendar from "../../components/Calendar.jsx";
import { BarLoader } from "react-spinners";
import { sanitizeError, sanitizeProduct, sanitizeImageUrl, sanitizeAltText } from "../../utils/sanitizer.js";
import OrderForm from "../../components/OrderForm.jsx";
import GalleryButtons from "../../components/Buttons/GalleryButtons.jsx";
import Article from "../../components/Article.jsx";
import ErrorBoundary from "../../components/ErrorBoundary.jsx";
import { useProducts } from "../../hooks/useProducts.js";
import useCart from "../../hooks/useCart.js";
import Cart from "../../components/Cart/Cart.jsx";
import CartIcon from "../../components/Cart/CartIcon.jsx";
import { useToast } from "../../components/Toast/ToastContainer";

export default function ResellMobile({ labelRef }) {
  const mobileScreenRef = useRef(null);
  const bookingContainerRef = useRef(null);
  const bookButtonRef = useRef(null);
  const articlesContainerRef = useRef(null);
  const collectionRef = useRef(null);
  const articleRef = useRef([]);
  const galleryButtonsRef = useRef(null);
  const cartRef = useRef(null);

  // Hook custom pour le cart
  const { addToCart, handleAddToCart, cartTotal, cartAsItem } = useCart();

  // Hook pour les toasts
  const { addToast } = useToast();

  // Sélecteurs individuels
  const cartVisible = useStore(state => state.cartVisible);
  const setCartVisible = useStore(state => state.setCartVisible);
  const isBooking = useStore(state => state.isBooking);
  const setIsBooking = useStore(state => state.setIsBooking);
  const collectionChosen = useStore(state => state.collectionChosen);
  const setCollectionChosen = useStore(state => state.setCollectionChosen);

  // Utiliser le hook personnalisé pour gérer les produits
  const { products, isLoading: productsLoading, error } = useProducts(true);

  const [imagesLoading, setImagesLoading] = useState(true);
  const [orderFormVisible, setOrderFormVisible] = useState(false);
  const [clickedArticleId, setClickedArticleId] = useState(null);
  const [displayedCollection, setDisplayedCollection] = useState("");
  const [showDescription, setShowDescription] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);



  useEffect(() => {
    setIsBooking(false);
    setClickedArticleId(null);

    // Reset collection states pour éviter le flash de l'ancienne page
    setDisplayedCollection("");
    setCollectionChosen("SACS");
  }, []);
    

  // Gestion du changement de collection
  useEffect(() => {
    if (!collectionChosen || !products?.length) return;

    const changeCollection = async () => {
      if (displayedCollection && collectionRef.current) {
        await gsap.to(collectionRef.current, {
          duration: 0.3,
          opacity: 0,
          ease: "power2.out"
        });
      }

      setDisplayedCollection(collectionChosen);
      setImagesLoading(true);

      const filteredProducts = products.filter(
        article => article?.collection?.name === collectionChosen
      );

      const imagePromises = filteredProducts.flatMap(article =>
        (article.images || []).map(img =>
          new Promise(resolve => {
            const image = new Image();
            image.onload = resolve;
            image.onerror = resolve;
            image.src = sanitizeImageUrl(img.image);
          })
        )
      );

      await Promise.all(imagePromises);
      setImagesLoading(false);

      // Attendre que React ait rendu les articles dans le DOM
      await new Promise(resolve => {
        requestAnimationFrame(() => {
          requestAnimationFrame(resolve);
        });
      });

      // Animer le fade-in seulement si le conteneur a du contenu
      if (collectionRef.current && collectionRef.current.children.length > 0) {
        gsap.to(collectionRef.current, {
          duration: 0.3,
          opacity: 1,
          ease: "power2.inOut"
        });
      }
    };

    changeCollection();
  }, [collectionChosen, products]);

  useGSAP(() => {
    gsap.to(mobileScreenRef.current, {
      duration: 0.25,
      ease: "power3.inOut",
      opacity: 1
    });
  }, []);

  useGSAP(() => {
    if (bookingContainerRef.current && isBooking) {
      gsap.to(bookingContainerRef.current, {
        duration: 0.40,
        ease: "power3.inOut",
        opacity: 1
      });
    }
  }, [isBooking]);

  // Masquer/afficher les GalleryButtons selon si un article est cliqué
  useGSAP(() => {
    if (galleryButtonsRef.current) {
        gsap.to(galleryButtonsRef.current, {
          duration: 0.3,
          ease: "power3.inOut",
          opacity: 1,
          pointerEvents: "auto"
        });
    }
  }, [clickedArticleId]);

  // Article click handlers (like desktop)
  const handleArticleClick = useCallback((clickedArticleElement, id) => {
    setClickedArticleId(id);

    // Capturer la position actuelle de l'article cliqué
    const rect = clickedArticleElement.getBoundingClientRect();
    const parent = clickedArticleElement.parentElement;
    const parentRect = parent.getBoundingClientRect();

    const timeline = gsap.timeline();

    // Figer la position de l'article cliqué en absolute
    timeline.set(clickedArticleElement, {
      position: 'absolute',
      top: rect.top - parentRect.top,
      left: rect.left - parentRect.left,
      width: rect.width,
      height: rect.height,
      zIndex: 10
    });

    // 1ère animation : Masquer les autres articles
    articleRef.current.forEach((ref) => {
      if (ref && ref !== clickedArticleElement) {
        timeline.to(ref, {
          duration: 0.5,
          ease: "power3.inOut",
          opacity: 0,
          width: 0,
          height: 0,
          pointerEvents: "none"
        }, 0);
      }
    });

    // 2ème animation : Agrandir l'article cliqué depuis sa position (en même temps)
    timeline
      .to(clickedArticleElement, {
        duration: 0.5,
        ease: "power3.inOut",
        top: 0,
        left: 0,
        width: "100%",
        height: "85%"
      }, 0)
      .call(() => {
        const detailsElement = clickedArticleElement.querySelector('.article-details');
        if (detailsElement) {
          gsap.fromTo(detailsElement,
            { opacity: 0 },
            {
              opacity: 1,
              duration: 0.25,
              ease: "power3.inOut"
            }
          );
        }
      });
  }, []);

  const handleArticleClose = useCallback((clickedArticleElement, e) => {
    e.stopPropagation();
    setClickedArticleId(null);

    // Réafficher tous les articles avec leurs dimensions originales
    articleRef.current.forEach((ref) => {
      if (ref) {
        gsap.to(ref, {
          duration: 0.5,
          ease: "power3.inOut",
          opacity: 1,
          width: "48%", // 2 colonnes avec un peu d'espace
          height: "45%",
          position: "relative",
          top: "auto",
          left: "auto",
          zIndex: "auto",
          pointerEvents: "auto"
        });
      }
    });
  }, []);

  function handleToggleCart() {
    if (cartVisible) {
      // Fermeture avec animation
      if (cartRef.current) {
        gsap.to(cartRef.current, {
          duration: 0.5,
          ease: "power3.inOut",
          opacity: 0,
          onComplete: () => {
            setCartVisible(false);
            // Réactiver le scroll de la galerie
            if (articlesContainerRef.current) {
              articlesContainerRef.current.style.overflow = 'auto';
            }
          }
        });
      }
    } else {
      // Ouverture simple
      setCartVisible(true);
      // Désactiver le scroll de la galerie
      if (articlesContainerRef.current) {
        articlesContainerRef.current.style.overflow = 'hidden';
      }
    }
  }

  function handleCheckout() {
    if (addToCart.length === 0) {
      addToast("Votre panier est vide", "warning");
      return;
    }
    setOrderFormVisible(true);
  }

  return (
    <div ref={mobileScreenRef} className="mobile-resell-container">

      {(productsLoading || imagesLoading) &&
        <BarLoader className="loader" color="#EFEC8F" height={6} speedMultiplier={1} width={107}/>
      }

      <div className="mobile-resell-gallery">
        <div ref={galleryButtonsRef}>
          <GalleryButtons type="resell" />
        </div>

        <ErrorBoundary>
          <div className="mobile-resell-gallery-articles" ref={collectionRef}>
            {error && <div style={{color: 'white', padding: '20px', backgroundColor: 'rgba(0,0,0,0.7)', margin: '10px'}}>{error}</div>}

            {!productsLoading && !imagesLoading &&
              (() => {
                if (!Array.isArray(products) || products.length === 0 || !displayedCollection) {
                  return null;
                }
                const filteredProducts = products.filter(article =>
                  article && article.collection && article.collection.name === displayedCollection
                );
                return filteredProducts.map((article, index) => (
                  <Article
                    key={article.id}
                    article={article}
                    index={index}
                    isClicked={clickedArticleId === article.id}
                    isAnyArticleClicked={clickedArticleId !== null}
                    handleArticleClick={handleArticleClick}
                    handleArticleClose={handleArticleClose}
                    handleAddToCart={handleAddToCart}
                    articleRefs={articleRef}
                    resell={true}
                    isMobile={true}
                  />
                ));
              })()
            }
          </div>
        </ErrorBoundary>
      </div>

      <CartIcon quantity={addToCart.length} onClick={handleToggleCart} />

      <Cart
        ref={cartRef}
        isOpen={cartVisible}
        onClose={handleToggleCart}
        onCheckout={handleCheckout}
      />

      {/* Calendrier de booking */}
      {isBooking && (
        <div ref={bookingContainerRef} className="booking-container" style={{ opacity: 0 }}>
          <BookingCalendar type="product" />
        </div>
      )}

      <OrderForm 
        item={cartAsItem}
        isOpen={orderFormVisible}
        onClose={() => setOrderFormVisible(false)}
      />

      <MenuButtons screenRef={mobileScreenRef} />
    </div>
  )
} 
