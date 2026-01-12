import MenuButtons from "../../components/Buttons/Menu.jsx";
import useStore from "../../utils/store.jsx";
import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import GalleryButtons from "../../components/Buttons/GalleryButtons.jsx";
import Article from "../../components/Article.jsx";
import "../hoolis/Hoolis.scss";
import "../../components/Buttons/GalleryButtons.scss";
import BookingCalendar from "../../components/Calendar.jsx";
import { BarLoader } from "react-spinners";
import OrderForm from "../../components/OrderForm.jsx";
import ErrorBoundary from "../../components/ErrorBoundary.jsx";
import { useProducts } from "../../hooks/useProducts.js";

export default function Resell() {

  const screenRef = useRef(null);
  const labelRef = useRef(null);
  const galleryRef = useRef(null);
  const articleRef = useRef([]);
  const collectionRef = useRef(null);
  const cartRef = useRef(null);
  const bookingContainerRef = useRef(null);

  const [hoveredArticleId, setHoveredArticleId] = useState(null);
  const [clickedArticleId, setClickedArticleId] = useState(null);
  const [displayedCollection, setDisplayedCollection] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderFormVisible, setOrderFormVisible] = useState(false);
  const is_resell = true;

  // Utiliser le hook personnalisé pour gérer les produits
  const products = useProducts(true);

  // Sélecteurs individuels
  const label = useStore(state => state.label);
  const setLabel = useStore(state => state.setLabel);
  const bgColor = useStore(state => state.bgColor);
  const labelColor = useStore(state => state.labelColor);
  const setLabelColor = useStore(state => state.setLabelColor);
  const setIsClicked = useStore(state => state.setIsClicked);
  const galleryVisible = useStore(state => state.galleryVisible);
  const setGalleryVisible = useStore(state => state.setGalleryVisible);
  const cartVisible = useStore(state => state.cartVisible);
  const setCartVisible = useStore(state => state.setCartVisible);
  const addToCart = useStore(state => state.addToCart);
  const setAddToCart = useStore(state => state.setAddToCart);
  const setMobileButtonsVisible = useStore(state => state.setMobileButtonsVisible);
  const collectionChosen = useStore(state => state.collectionChosen);
  const setCollectionChosen = useStore(state => state.setCollectionChosen);
  const setIsMouseActive = useStore(state => state.setIsMouseActive);
  const isBooking = useStore(state => state.isBooking);
  const setIsBooking = useStore(state => state.setIsBooking);

  useEffect(() => {
    setIsClicked(false);
    setLabel("");
    setLabelColor(bgColor);
    setGalleryVisible(false);
    setHoveredArticleId(0);
    setClickedArticleId(null);
    setCartVisible(false);
    setMobileButtonsVisible(false);
    setIsMouseActive(false);
    setIsBooking(false);

    // Reset collection states pour éviter le flash de l'ancienne page
    setDisplayedCollection("");
    setCollectionChosen("SACS");
  }, []);  

  useGSAP(() => {
    gsap.to(screenRef.current, {
      duration: 0.45,
      ease: "power3.inOut",
      opacity: 1
    });
  }, []);

  //useEffect(() => {
  //  
  //  if (galleryVisible && galleryRef.current) {
  //    galleryRef.current.style.opacity = "0";
  //    gsap.to(galleryRef.current, {
  //      duration: 1.5,
  //      ease: "power3.inOut",
  //      opacity: 1
  //    });
  //  }
  //}, [galleryVisible]);


  // Gestion du changement de collection
  useEffect(() => {
    if (!collectionChosen || !products?.length) return;

    const changeCollection = async () => {
      // Si on a déjà une collection affichée, fade out d'abord
      if (displayedCollection && collectionRef.current) {
        await gsap.to(collectionRef.current, {
          duration: 0.3,
          opacity: 0,
          ease: "power2.out"
        });
      }

      // Mettre à jour et preload
      setDisplayedCollection(collectionChosen);
      setLoading(true);

      // Preload images
      const filteredProducts = products.filter(
        article => article?.collection?.name === collectionChosen
      );

      const imagePromises = filteredProducts.flatMap(article =>
        (article.images || []).map(img =>
          new Promise(resolve => {
            const image = new Image();
            image.onload = resolve;
            image.onerror = resolve;
            image.src = img.image;
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
          duration: 0.4,
          opacity: 1,
          ease: "power2.inOut"
        });
      }
    };

    changeCollection();
  }, [collectionChosen, products]);

  useGSAP(() => {
    if (bookingContainerRef.current) {
      gsap.to(bookingContainerRef.current, {
        duration: 0.40,
        ease: "power3.inOut",
        opacity: 1
      });
    } else if (bookingContainerRef.current) {
      gsap.to(bookingContainerRef.current, {
        duration: 0.40,
        ease: "power3.inOut",
        opacity: 0
      });
    }
  }, [isBooking]);




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
    setHoveredArticleId(null);

    // Réafficher tous les articles avec leurs dimensions originales
    articleRef.current.forEach((ref) => {
      if (ref) {
        gsap.to(ref, {
          duration: 0.5,
          ease: "power3.inOut",
          opacity: 1,
          width: "30%",
          height: "45%",
          position: "relative",
          top: "auto",
          left: "auto",
          zIndex: "auto",
          pointerEvents: "auto"
        });
      }
    });
  }, [])

  const handleAddToCart = useCallback((article, e) => {
    e.stopPropagation();
    setAddToCart(prevCart => {
      return [...prevCart, {...article, cartid: prevCart.length + 1}]
    });
    alert("Article ajouté au panier");
  }, []);

  function handleRemoveItem(item) {
    setAddToCart(prevCart => prevCart.filter(
      cartItem => cartItem.cartid !== item.cartid
    ));
  }
  
  const handleOpenCart = useCallback(() => {
    setCartVisible(true);
    requestAnimationFrame(() => {
      if (cartRef.current) {
        gsap.to(cartRef.current, {
          duration: 0.5,
          ease: "power3.inOut",
          opacity: 1,
          immediateRender: false
        });
      }
    });
  }, []);
  
  function handleCloseCart() {
    if (cartRef.current) {
      gsap.to(cartRef.current, {
        duration: 0.5,
        ease: "power3.inOut",
        opacity: 0,
        onComplete: () => {
          setCartVisible(false);
          if (cartRef.current) {
            cartRef.current.style.opacity = 0;
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
  <>

    <div ref={screenRef} className="resell-container">
      <div className="resell-landing">
        <img 
            src="/hoolis-img/mouth-tee-back.jpg" 
            alt="T-shirt Coquillage Hoolis - Collection Exclusive - Vue Portée" 
            loading="lazy" 
        />
        <div ref={galleryRef} className="resell-gallery">
          <GalleryButtons type="resell"/>
          <hr style={{color: "white", width: "100%", position: "relative", bottom: "265px"}}/>
          <ErrorBoundary>
            <div className="resell-gallery-articles" ref={collectionRef}>
              {loading &&
                <BarLoader className="loader" color="#EFEC8F" height={10} speedMultiplier={1} width={200}/>
              }
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
                    resell={is_resell}
                    />
                  ));
                })()
              }
            </div>
          </ErrorBoundary>
        </div>
          
        <div className="cart-icon" onClick={handleOpenCart}>
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

        {cartVisible &&
        <div className="cart-container" ref={cartRef} style={{ opacity: 0 }}>
          <div className="bg-cart"></div>
          <h1 className="cart-title">TOTAL : {cartTotal}€</h1>
          <h1 className="close-cart" onClick={handleCloseCart}>FERMER</h1>
          <hr />
          <div className="cart-items">
            {addToCart.length === 0 && (
              <div className="cart-item">
                <h2 className="cart-item-title">Votre panier est vide</h2>
              </div>
            )}
            {addToCart.map((item) => (
              <div key={item.cartid} className="cart-item">
                <img
                  src={item.images[0].image}
                  alt={`${item.title} - Article de luxe Hoolis dans le panier`}
                  loading="lazy"
                />
                <h2 className="cart-item-title">{item.title}</h2>
                <div className="cart-item-details">
                  <p>{item.price}€</p>
                  <h2
                    className="remove-item"
                    onClick={() => handleRemoveItem(item)}
                  >
                    SUPPRIMER
                  </h2>
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

        
        {isBooking ? (
          <div ref={bookingContainerRef} className="booking-container">
            <BookingCalendar type="product" />
            <button className="close-booking-button" onClick={() => setIsBooking(false)}>X</button>
          </div>
        ) : null}

        <OrderForm 
          item={cartAsItem}
          isOpen={orderFormVisible}
          onClose={() => setOrderFormVisible(false)}
        />

        <MenuButtons screenRef={screenRef} />
      </div>
      <h1 ref={labelRef} className="title-label" style={{color: labelColor}}>{label}</h1>
    </div>
  </>
  );
}

