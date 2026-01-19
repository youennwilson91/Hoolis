import MenuButtons from "../../components/Buttons/MenuMobile.jsx";
import useStore from "../../utils/store.jsx";
import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import "./Hoolis.scss";
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

export default function HoolisMobile({ labelRef }) {
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

  // Sélecteurs individuels
  const cartVisible = useStore(state => state.cartVisible);
  const setCartVisible = useStore(state => state.setCartVisible);
  const isBooking = useStore(state => state.isBooking);
  const setIsBooking = useStore(state => state.setIsBooking);
  const collectionChosen = useStore(state => state.collectionChosen);
  const setCollectionChosen = useStore(state => state.setCollectionChosen);

  // Utiliser le hook personnalisé pour gérer les produits
  const products = useProducts(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDescription, setShowDescription] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderFormVisible, setOrderFormVisible] = useState(false);
  const [clickedArticleId, setClickedArticleId] = useState(null);
  const [displayedCollection, setDisplayedCollection] = useState("");



  useEffect(() => {
    setIsBooking(false);
    setClickedArticleId(null);

    // Reset collection states pour éviter le flash de l'ancienne page
    setDisplayedCollection("");
    setCollectionChosen("MAROQUINERIE");
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
      setLoading(true);

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
      setLoading(false);

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

  useGSAP(() => {
    if (bookingContainerRef.current && isBooking) {
      gsap.to(bookingContainerRef.current, {
        duration: 0.40,
        ease: "power3.inOut",
        opacity: 1
      });
    }
  }, [isBooking]);

  // Article click handlers (like ResellMobile)
  const handleArticleClick = useCallback((clickedArticleElement, id) => {
    setClickedArticleId(id);
    // Masquer les autres articles en les réduisant à 0
    articleRef.current.forEach((ref) => {
      if (ref && ref !== clickedArticleElement) {
        gsap.to(ref, {
          duration: 0.5,
          ease: "power3.inOut",
          opacity: 0,
          width: 0,
          height: 0,
          pointerEvents: "none"
        });
      }
    });

    gsap.timeline()
      .to(clickedArticleElement, {
        duration: 0.5,
        ease: "power3.inOut",
        width: "100%",
        height: "85%"
      })
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
      alert("Votre panier est vide");
      return;
    }
    setOrderFormVisible(true);
  }

  return (
    <div ref={mobileScreenRef} className="mobile-hoolis-container">
      <div className="mobile-hoolis-gallery">
        <div ref={galleryButtonsRef}>
          <GalleryButtons type="hoolis" />
        </div>
        <ErrorBoundary>
          <div className="mobile-hoolis-gallery-articles" ref={collectionRef}>
            {loading && <BarLoader className="loader" color="#EFEC8F" height={6} speedMultiplier={1} width={107}/>}
            {error && <div style={{color: 'white', padding: '20px', backgroundColor: 'rgba(0,0,0,0.7)', margin: '10px'}}>{error}</div>}

            {!loading &&
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
                    handleArticleClick={handleArticleClick}
                    handleArticleClose={handleArticleClose}
                    handleAddToCart={handleAddToCart}
                    articleRefs={articleRef}
                    resell={false}
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
