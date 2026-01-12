import MenuButtons from "../../components/Buttons/MenuMobile.jsx";
import useStore from "../../utils/store.jsx";
import { useRef, useEffect, useState, useCallback, useMemo } from "react";
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

export default function ResellMobile({ labelRef, handleAddToCart, handleRemoveItem }) {
  const mobileScreenRef = useRef(null);
  const mobileCartRef = useRef(null);
  const bookingContainerRef = useRef(null);
  const bookButtonRef = useRef(null);
  const articlesContainerRef = useRef(null);
  const collectionRef = useRef(null);
  const articleRef = useRef([]);
  const galleryButtonsRef = useRef(null);

  // Sélecteurs individuels
  const cartVisible = useStore(state => state.cartVisible);
  const setCartVisible = useStore(state => state.setCartVisible);
  const addToCart = useStore(state => state.addToCart);
  const isBooking = useStore(state => state.isBooking);
  const setIsBooking = useStore(state => state.setIsBooking);
  const collectionChosen = useStore(state => state.collectionChosen);
  const setCollectionChosen = useStore(state => state.setCollectionChosen);

  // Utiliser le hook personnalisé pour gérer les produits
  const products = useProducts(true);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
        height: "100%"
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

  function handleOpenMobileCart() {
    setCartVisible(true);
    // Désactiver le scroll de la galerie
    if (articlesContainerRef.current) {
      articlesContainerRef.current.style.overflow = 'hidden';
    }
    requestAnimationFrame(() => {
      if (mobileCartRef.current) {
        gsap.to(mobileCartRef.current, {
          duration: 0.5,
          ease: "power3.inOut",
          opacity: 1,
          immediateRender: false
        });
      }
    });
  }

  function handleCloseMobileCart() {
    if (mobileCartRef.current) {
      gsap.to(mobileCartRef.current, {
        duration: 0.5,
        ease: "power3.inOut",
        opacity: 0,
        onComplete: () => {
          setCartVisible(false);
          // Réactiver le scroll de la galerie
          if (articlesContainerRef.current) {
            articlesContainerRef.current.style.overflow = 'auto';
          }
          if (mobileCartRef.current) {
            mobileCartRef.current.style.opacity = 0;
          }
        }
      });
    }
  }

  function handleCheckout() {
    if (addToCart.length === 0) {
      alert("Votre panier est vide");
      return;
    }
    setOrderFormVisible(true);
  }

  // Mémoïser le total du panier
  const cartTotal = useMemo(() => {
    return addToCart.reduce((total, item) => {
      const price = parseInt(item.price);
      const quantity = item.quantity || 1;
      return total + (price * quantity);
    }, 0);
  }, [addToCart]);

  // Mémoïser l'objet panier
  const cartAsItem = useMemo(() => ({
    id: 'cart',
    name: `Commande (${addToCart.length} article${addToCart.length > 1 ? 's' : ''})`,
    price: cartTotal,
    wide: addToCart.length > 0 ? [{ media: addToCart[0].images[0].image }] : [],
    isCart: true,
    cartItems: addToCart
  }), [addToCart, cartTotal]);

  return (
    <div ref={mobileScreenRef} className="mobile-resell-container">
      <div className="mobile-resell-gallery">
        <div ref={galleryButtonsRef}>
          <GalleryButtons type="resell" />
        </div>
        <ErrorBoundary>
          <div className="mobile-resell-gallery-articles" ref={collectionRef}>
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
                    resell={true}
                    isMobile={true}
                  />
                ));
              })()
            }
          </div>
        </ErrorBoundary>
      </div>

      {/* Icône du panier fixe - en dehors du conteneur scrollable */}
      <div className="cart-icon" onClick={cartVisible ? handleCloseMobileCart : handleOpenMobileCart}>
        <h1 className="cart-quantity">{addToCart.length}</h1>
        <svg viewBox="0 0 32 32">
          <title/>
          <g data-name="Layer 2" id="Layer_2">
            <path d="M23.52,29h-15a5.48,5.48,0,0,1-5.31-6.83L6.25,9.76a1,1,0,0,1,1-.76H24a1,1,0,0,1,1,.7l3.78,12.16a5.49,5.49,0,0,1-.83,
            4.91A5.41,5.41,0,0,1,23.52,29ZM8,11,5.11,22.65A3.5,3.5,0,0,0,8.48,27h15a3.44,3.44,0,0,0,2.79-1.42,3.5,3.5,0,0,0,.53-3.13L23.28,11Z"/>
            <path d="M20,17a1,1,0,0,1-1-1V8a3,3,0,0,0-6,0v8a1,1,0,0,1-2,0V8A5,5,0,0,1,21,8v8A1,1,0,0,1,20,17Z"/>
          </g>
        </svg>
      </div>

      {/* Cart modal - en dehors du conteneur scrollable pour un positionnement correct */}
      {cartVisible && 
        <div className="cart-container" ref={mobileCartRef} style={{ opacity: 0 }}>
          <div className="bg-cart"></div>
          <div className="cart-items">
            {addToCart.length === 0 && (
              <div className="cart-item">
                <h2 className="cart-item-title">Votre panier est vide</h2>
              </div>
            )}
            {addToCart.map((item) => (
              <div key={item.cartid} className="cart-item">
                <img 
                  src={sanitizeImageUrl(item.images[0].image)} 
                  alt={sanitizeAltText(`${item.title} - Article de luxe Hoolis dans le panier`)} 
                  loading="lazy"
                  decoding="async"
                  style={{ backgroundColor: '#f0f0f0' }}
                />
                <h2 className="cart-item-title">{item.title}</h2>
                <div className="cart-item-details">
                  <p>{item.price} €</p>
                  <button 
                    className="remove-item-btn" 
                    onClick={() => handleRemoveItem(item)}
                    aria-label="Supprimer l'article"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0,0,256,256" className="trash-icon">
                      <g transform="scale(5.33333,5.33333)">
                        <path d="M34,12l-6,-6h-8l-6,6h-3v28c0,2.2 1.8,4 4,4h18c2.2,0 4,-1.8 4,-4v-28z" fill="currentColor"></path>
                        <path d="M24.5,39h-1c-0.8,0 -1.5,-0.7 -1.5,-1.5v-19c0,-0.8 0.7,-1.5 1.5,-1.5h1c0.8,0 1.5,0.7 1.5,1.5v19c0,0.8 -0.7,1.5 -1.5,1.5zM31.5,39v0c-0.8,0 -1.5,-0.7 -1.5,-1.5v-19c0,-0.8 0.7,-1.5 1.5,-1.5v0c0.8,0 1.5,0.7 1.5,1.5v19c0,0.8 -0.7,1.5 -1.5,1.5zM16.5,39v0c-0.8,0 -1.5,-0.7 -1.5,-1.5v-19c0,-0.8 0.7,-1.5 1.5,-1.5v0c0.8,0 1.5,0.7 1.5,1.5v19c0,0.8 -0.7,1.5 -1.5,1.5z" fill="white"></path>
                        <path d="M11,8h26c1.1,0 2,0.9 2,2v2h-30v-2c0,-1.1 0.9,-2 2,-2z" fill="currentColor"></path>
                      </g>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
          {addToCart.length > 0 && (
            <button className="checkout-button" onClick={handleCheckout}>
              COMMANDER - {cartTotal}€
            </button>
          )}
        </div>
      }

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
