import MenuButtons from "../../components/Buttons/Menu.jsx";
import useStore from "../../utils/store.jsx";
import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import GalleryButtons from "../../components/Buttons/GalleryButtons.jsx";
import Article from "../../components/Article.jsx";
import "./Hoolis.scss";
import "../../components/Buttons/GalleryButtons.scss";
// BOOKING DISABLED
// import BookingCalendar from "../../components/Calendar.jsx";
import { BarLoader } from "react-spinners";
import OrderForm from "../../components/OrderForm.jsx";
import ErrorBoundary from "../../components/ErrorBoundary.jsx";
import { useProducts } from "../../hooks/useProducts.js";
import useCart from "../../hooks/useCart.js";
import Cart from "../../components/Cart/Cart.jsx";
import CartIcon from "../../components/Cart/CartIcon.jsx";

export default function HoolisDesktop() {

  const screenRef = useRef(null);
  const labelRef = useRef(null);
  const galleryRef = useRef(null);
  const articleRef = useRef([]);
  const collectionRef = useRef(null);
  // BOOKING DISABLED
  // const bookingContainerRef = useRef(null);
  const cartRef = useRef(null);

  const [hoveredArticleId, setHoveredArticleId] = useState(null);
  const [clickedArticleId, setClickedArticleId] = useState(null);
  const [displayedCollection, setDisplayedCollection] = useState("");
  const [imagesLoading, setImagesLoading] = useState(false);
  const [orderFormVisible, setOrderFormVisible] = useState(false);
  const is_resell = false;

  // Utiliser le hook personnalisé pour gérer les produits
  const { products, isLoading: productsLoading } = useProducts(false);

  // Hook custom pour le cart
  const { addToCart, handleAddToCart, cartTotal, cartAsItem } = useCart();

  // Sélecteurs individuels - plus sûrs
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
  // BOOKING DISABLED
  // const isBooking = useStore(state => state.isBooking);
  // const setIsBooking = useStore(state => state.setIsBooking);

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
    // BOOKING DISABLED
    // setIsBooking(false);

    // Reset collection states pour éviter le flash de l'ancienne page
    setDisplayedCollection("");
    setCollectionChosen("VETEMENTS");
  }, []);  

  useGSAP(() => {
    gsap.to(screenRef.current, {
      duration: 0.45,
      ease: "power3.inOut",
      opacity: 1
    });
  }, []);

  // Gestion du changement de collection
  useEffect(() => {
    if (!collectionChosen || !products?.length) return;

    const changeCollection = async () => {
      if (displayedCollection && collectionRef.current) {
        await gsap.to(collectionRef.current, {
          duration: 0.5,
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
          duration: 0.5,
          opacity: 1,
          ease: "power2.inOut"
        });
      }
    };

    changeCollection();
  }, [collectionChosen, products]);

  // BOOKING DISABLED
  // useGSAP(() => {
  //   if (bookingContainerRef.current) {
  //     gsap.to(bookingContainerRef.current, {
  //       duration: 0.40,
  //       ease: "power3.inOut",
  //       opacity: 1
  //     });
  //   } else if (bookingContainerRef.current) {
  //     gsap.to(bookingContainerRef.current, {
  //       duration: 0.40,
  //       ease: "power3.inOut",
  //       opacity: 0
  //     });
  //   }
  // }, [isBooking]);


  const handleArticleHover = useCallback(({width, articleRef, id}) => {
    setHoveredArticleId(id);
    gsap.to(articleRef , { width, duration: 0.5});
  }, []);

  const handleArticleClick = useCallback((articleRef, id) => {
    setClickedArticleId(id);
    gsap.timeline()
      .to(articleRef, {
        duration: 0.4,
        ease: "power3.inOut",
        width: "55%",
        height: "100%"
      })
      .call(() => {
        const detailsElement = articleRef.querySelector('.article-details');
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

  const handleArticleClose = useCallback((articleRef, e) => {
    e.stopPropagation();
    setClickedArticleId(null);
    setHoveredArticleId(null);
    gsap.to(articleRef, {
      duration: 0.5,
      ease: "power3.inOut",
      width: "7%",
      height: "100%"
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

    <div ref={screenRef} className="shop-container">
      <div className="shop-landing">
        <img 
            src="/hoolis-img/gainsbourglove.jpeg" 
            alt="T-shirt Coquillage Hoolis - Collection Exclusive - Vue Portée" 
            loading="lazy" 
        />
        <div ref={galleryRef} className="shop-gallery">
          <GalleryButtons type="hoolis"/>
          <hr style={{color: "white", width: "100%", position: "relative", bottom: "265px"}}/>

          {(productsLoading || imagesLoading) &&
            <BarLoader className="loader" color="#EFEC8F" height={10} speedMultiplier={1} width={200}/>
          }

          <ErrorBoundary>
            <div className="shop-gallery-articles" ref={collectionRef}>
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
                    handleArticleHover={handleArticleHover}
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

        {/* BOOKING DISABLED */}
        {/* {isBooking ? (
          <div ref={bookingContainerRef} className="booking-container">
            <BookingCalendar type="product" />
            <button className="close-booking-button" onClick={() => setIsBooking(false)}>X</button>
          </div>
        ) : null} */}

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

