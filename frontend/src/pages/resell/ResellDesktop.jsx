import MenuButtons from "../../components/Buttons/Menu.jsx";
import useStore from "../../utils/store.jsx";
import { useRef, useEffect, useState, useCallback } from "react";
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
import useCart from "../../hooks/useCart.js";
import Cart from "../../components/Cart/Cart.jsx";
import CartIcon from "../../components/Cart/CartIcon.jsx";

export default function Resell() {

  const screenRef = useRef(null);
  const labelRef = useRef(null);
  const galleryRef = useRef(null);
  const articleRef = useRef([]);
  const collectionRef = useRef(null);
  const bookingContainerRef = useRef(null);
  const cartRef = useRef(null);

  const [hoveredArticleId, setHoveredArticleId] = useState(null);
  const [clickedArticleId, setClickedArticleId] = useState(null);
  const [displayedCollection, setDisplayedCollection] = useState("");
  const [imagesLoading, setImagesLoading] = useState(false);
  const [orderFormVisible, setOrderFormVisible] = useState(false);
  const is_resell = true;

  // Utiliser le hook personnalisé pour gérer les produits
  const { products, isLoading: productsLoading } = useProducts(true);

  // Hook custom pour le cart
  const { addToCart, handleAddToCart, cartTotal, cartAsItem } = useCart();

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

  // Initialiser l'opacité du conteneur d'articles (pour que le loader soit visible)
  useEffect(() => {
    if (collectionRef.current) {
      gsap.set(collectionRef.current, { opacity: 1 });
    }
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
      setImagesLoading(true);

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
          }
        });
      }
    } else {
      // Ouverture simple
      setCartVisible(true);
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
              {(productsLoading || imagesLoading) &&
                <BarLoader className="loader" color="#EFEC8F" height={10} speedMultiplier={1} width={200}/>
              }
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
                    resell={is_resell}
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

