import MenuButtons from "../../components/Buttons/MenuMobile.jsx";
import useStore from "../../utils/store.jsx";
import { useRef, useEffect, useState, useCallback } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import "./Hoolis.scss";
// BOOKING DISABLED
// import BookingCalendar from "../../components/Calendar.jsx";
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

export default function HoolisMobile({ labelRef }) {
  const mobileScreenRef = useRef(null);
  // BOOKING DISABLED
  // const bookingContainerRef = useRef(null);
  // const bookButtonRef = useRef(null);
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
  // BOOKING DISABLED
  // const isBooking = useStore(state => state.isBooking);
  // const setIsBooking = useStore(state => state.setIsBooking);
  const collectionChosen = useStore(state => state.collectionChosen);
  const setCollectionChosen = useStore(state => state.setCollectionChosen);

  // Utiliser le hook personnalisé pour gérer les produits
  const { products, isLoading: productsLoading, error } = useProducts(false);

  const [imagesLoading, setImagesLoading] = useState(() => !(products?.length > 0));
  const [showDescription, setShowDescription] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderFormVisible, setOrderFormVisible] = useState(false);
  const [clickedArticleId, setClickedArticleId] = useState(null);
  const [displayedCollection, setDisplayedCollection] = useState("");



  useEffect(() => {
    // BOOKING DISABLED
    // setIsBooking(false);
    setClickedArticleId(null);

    // Reset collection states pour éviter le flash de l'ancienne page
    setDisplayedCollection("");
    setCollectionChosen("VETEMENTS");
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
          duration: 0.25,
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
          duration: 0.25,
          ease: "power3.inOut",
          opacity: 1,
          pointerEvents: "auto"
        });
    }
  }, [clickedArticleId]);

  // Animer le remount des articles quand on ferme (fade in)
  useEffect(() => {
    if (clickedArticleId === null && articleRef.current.length > 0) {
      articleRef.current.forEach((ref) => {
        if (ref) {
          gsap.fromTo(ref,
            { opacity: 0 },
            {
              duration: 0.25,
              ease: "power3.inOut",
              opacity: 1
            }
          );
        }
      });
    }
  }, [clickedArticleId]);

  // BOOKING DISABLED
  // useGSAP(() => {
  //   if (bookingContainerRef.current && isBooking) {
  //     gsap.to(bookingContainerRef.current, {
  //       duration: 0.40,
  //       ease: "power3.inOut",
  //       opacity: 1
  //     });
  //   }
  // }, [isBooking]);

  // Article click handlers (like ResellMobile)
  const handleArticleClick = useCallback((clickedArticleElement, id) => {
    // Fade out tous les articles
    articleRef.current.forEach((ref) => {
      if (ref) {
        gsap.to(ref, {
          duration: 0.25,
          ease: "power3.inOut",
          opacity: 0
        });
      }
    });

    // Après le fade out, unmount les autres et fade in l'article cliqué
    setTimeout(() => {
      setClickedArticleId(id);

      // Fade in de l'article cliqué
      gsap.fromTo(clickedArticleElement,
        { opacity: 0 },
        {
          duration: 0.25,
          ease: "power3.inOut",
          opacity: 1,
        }
      );
    }, 300);
  }, []);

  const handleArticleClose = useCallback((clickedArticleElement, e) => {
    e.stopPropagation();

    // Fade out l'article cliqué
    gsap.to(clickedArticleElement, {
      duration: 0.25,
      ease: "power3.inOut",
      opacity: 0,
      onComplete: () => {
        // Remount tous les articles
        setClickedArticleId(null);
      }
    });
  }, []);

  function handleToggleCart() {
    if (cartVisible) {
      // Fermeture avec animation
      if (cartRef.current) {
        gsap.to(cartRef.current, {
          duration: 0.25,
          ease: "power3.inOut",
          opacity: 0,
          onComplete: () => {
            setCartVisible(false);
            // Réactiver le scroll de la galerie
            if (collectionRef.current) {
              collectionRef.current.classList.remove('cart-open');
            }
          }
        });
      }
    } else {
      // Ouverture simple
      setCartVisible(true);
      // Désactiver le scroll de la galerie
      if (collectionRef.current) {
        collectionRef.current.classList.add('cart-open');
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
    <div ref={mobileScreenRef} className="mobile-hoolis-container">

      {(productsLoading || imagesLoading) &&
        <BarLoader className="loader" color="#EFEC8F" height={6} speedMultiplier={1} width={107}/>
      }

      <div className="mobile-hoolis-gallery">
        <div ref={galleryButtonsRef}>
          <GalleryButtons type="hoolis" />
        </div>

        <ErrorBoundary>
          <div className="mobile-hoolis-gallery-articles" ref={collectionRef}>
            {error && <div style={{color: 'white', padding: '20px', backgroundColor: 'rgba(0,0,0,0.7)', margin: '10px'}}>{error}</div>}

            {!productsLoading && !imagesLoading &&
              (() => {
                if (!Array.isArray(products) || products.length === 0 || !displayedCollection) {
                  return null;
                }
                let filteredProducts = products.filter(article =>
                  article && article.collection && article.collection.name === displayedCollection
                );

                // Si un article est cliqué, ne rendre que celui-là
                if (clickedArticleId !== null) {
                  filteredProducts = filteredProducts.filter(article => article.id === clickedArticleId);
                }

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

      {/* BOOKING DISABLED */}
      {/* {isBooking && (
        <div ref={bookingContainerRef} className="booking-container" style={{ opacity: 0 }}>
          <BookingCalendar type="product" />
        </div>
      )} */}

      <OrderForm 
        item={cartAsItem}
        isOpen={orderFormVisible}
        onClose={() => setOrderFormVisible(false)}
      />

      <MenuButtons screenRef={mobileScreenRef} />
    </div>
  )
} 
