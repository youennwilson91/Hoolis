import Button from "../components/NavButtons.jsx";
import useStore from "../utils/store.jsx";
import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import ShopButtons from "../components/GalleryButtons.jsx";
import Article from "../components/Article.jsx";
import "./Shop.scss";
import "../components/GalleryButtons.scss";
import ShopMobile from "./ShopMobile.jsx";
import BookingCalendar from "../components/Calendar.jsx";
import { apiClient, API_ENDPOINTS } from "../utils/axiosConfig";
import { BarLoader } from "react-spinners";

export default function Shop() {

  const screenRef = useRef(null);
  const labelRef = useRef(null);
  const galleryRef = useRef(null);
  const articleRef = useRef([]);
  // const descriptionRef = useRef(null); // Plus utilisé
  const collectionRef = useRef(null);
  const cartRef = useRef(null);
  const bookingContainerRef = useRef(null);
  const loaderRef = useRef(null);

  const [articleIsHovered, setArticleIsHovered] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState(null);
  const [clickedArticleId, setClickedArticleId] = useState(null);
  const [displayedCollection, setDisplayedCollection] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { 
    label, setLabel, 
    bgColor, setBgColor, 
    labelColor, setLabelColor, 
    setIsClicked, 
    galleryVisible, setGalleryVisible, 
    articleIsClicked, setArticleIsClicked, 
    cartVisible, setCartVisible, 
    addToCart, setAddToCart,
    setMobileButtonsVisible,
    collectionChosen, setCollectionChosen,
    products = [], setProducts,
    isMouseActive, setIsMouseActive,
    isBooking, setIsBooking
  } = useStore();

  useEffect(() => {
    setIsClicked(false);
    setLabel("");
    setLabelColor(bgColor);
    setGalleryVisible(false); 
    setCollectionChosen("VETEMENTS");
    setArticleIsHovered(false);
    setArticleIsClicked(false);
    setSelectedArticleId(null);
    setCartVisible(false);
    setMobileButtonsVisible(false);
    setIsMouseActive(false);
    setIsBooking(false);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await apiClient.get(API_ENDPOINTS.products);
        let productsData = response.data.results;
        
        if (productsData && Array.isArray(productsData)) {
          setProducts(productsData);
          console.log("✅ Produits récupérés:", productsData.length);
        } else {
          console.log("⚠️ Aucun produit trouvé");
          setProducts([]);
        }

      } 
      catch (error) {
        console.error('❌ Erreur lors de la récupération des produits:', error);
        setProducts([]);
      }
    };
    fetchProducts();

  }, []);

  useGSAP(() => {
    gsap.to(screenRef.current, {
      duration: 1,
      ease: "power3.inOut",
      opacity: 1
    });
  }, []);

  useEffect(() => {
    
    if (galleryVisible && galleryRef.current) {
      galleryRef.current.style.opacity = "0";
      gsap.to(galleryRef.current, {
        duration: 0.75,
        ease: "power3.inOut",
        opacity: 1
      });
    }
  }, [galleryVisible]);

  // Function to preload images for a collection
  function preloadCollectionImages(collection) {
    setLoading(true);
    
    if (!Array.isArray(products) || products.length === 0 || !collection) {
      setLoading(false);
      return;
    }

    const filteredProducts = products.filter(article => 
      article && article.collection && article.collection.name === collection
    );

    if (filteredProducts.length === 0) {
      setLoading(false);
      return;
    }

    const imagePromises = [];
    
    filteredProducts.forEach(article => {
      if (article.images && article.images.length > 0) {
        article.images.forEach(imageObj => {
          if (imageObj.image) {
            const promise = new Promise((imgResolve) => {
              const img = new Image();
              img.onload = () => imgResolve();
              img.onerror = () => imgResolve(); // Resolve even on error to avoid blocking
              img.src = imageObj.image;
            });
            imagePromises.push(promise);
          }
        });
      }
    });

    if (imagePromises.length === 0) {
      setLoading(false);
      return;
    }

    Promise.all(imagePromises).then(() => {
      // Wait for next frame to ensure DOM is ready
      requestAnimationFrame(() => {
        setLoading(false);
      });
    });
  };

  useGSAP(() => {
    if (collectionChosen && collectionRef.current) {
      // Only fade out if we already have a displayed collection
      if (displayedCollection) {
        const timeline = gsap.timeline();
        timeline.to(collectionRef.current, {
          duration: 0.40,
          ease: "power3.inOut",
          opacity: 0,
          onComplete: () => {
            setDisplayedCollection(collectionChosen);
            preloadCollectionImages(collectionChosen);
          }
        });
      } else {
        // First time opening, set collection and preload immediately
        setDisplayedCollection(collectionChosen);
        preloadCollectionImages(collectionChosen);
      }
    }
  }, [collectionChosen, products]);

  // Separate useGSAP for the fade-in animation when images are loaded
  useGSAP(() => {
    if (!loading && collectionRef.current && displayedCollection) {
      gsap.to(collectionRef.current, {
        duration: 0.40,
        ease: "power3.inOut",
        opacity: 1
      });
    }
  }, [loading, displayedCollection]);

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


  function handleArticleHover({width, articleRef, id, isEntering}) {
    if (!articleIsClicked) {
      setArticleIsHovered(isEntering);
      setSelectedArticleId(id);
      
      const timeline = gsap.timeline();

      timeline
        .to(articleRef, {
          duration: 0.5,
          ease: "power3.inOut",
          width: width,
        })
    }
  }

  function handleArticleClick(articleRef, id) {
    if (!articleIsClicked) {
      setArticleIsClicked(true);
      setClickedArticleId(id);
      const timeline = gsap.timeline();

      timeline
        .to(articleRef, {
          duration: 0.5,
          ease: "power3.inOut",
          width: "100%",
          height: "100%"
        })
        .call(() => {
          // Attendre que l'élément soit monté avant d'animer
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
    }
  }

  function handleArticleClose(articleRef, e) {
    e.stopPropagation();
    setClickedArticleId(null);
    setArticleIsClicked(false);
    gsap.to(articleRef, {
      duration: 0.5,
      ease: "power3.inOut",
      width: "7%",
      height: "100%"
    });
  }

 //function handleAddToCart(article) {
 //  setAddToCart(prevCart => {
 //    return [...prevCart, {...article, cartid: prevCart.length + 1}]
 //  });
 //}

  //function handleRemoveItem(item) {
  //  setAddToCart(prevCart => prevCart.filter(
  //    cartItem => cartItem.cartid !== item.cartid
  //  ));
  //}
  //
  //function handleOpenCart() {
  //  setCartVisible(true);
  //  requestAnimationFrame(() => {
  //    if (cartRef.current) {
  //      gsap.to(cartRef.current, {
  //        duration: 0.5,
  //        ease: "power3.inOut",
  //        opacity: 1,
  //        immediateRender: false
  //      });
  //    }
  //  });
  //}
//
  //function handleCloseCart() {
  //  if (cartRef.current) {
  //    gsap.to(cartRef.current, {
  //      duration: 0.5,
  //      ease: "power3.inOut",
  //      opacity: 0,
  //      onComplete: () => {
  //        setCartVisible(false);
  //        if (cartRef.current) {
  //          cartRef.current.style.opacity = 0;
  //        }
  //      }
  //    });
  //  }
  //}

  return (
  <>

    <div ref={screenRef} className="shop-container">
      <div className="shop-landing">
        <video src="/shop-img/bg-vid-shop.mp4" autoPlay muted loop />
        <div ref={galleryRef} className="shop-gallery">
          <ShopButtons/>
          <hr style={{color: "white", width: "100%", position: "relative", bottom: "265px"}}/>
          <div className="shop-gallery-articles" ref={collectionRef}> 
            {loading && 
              <BarLoader className="loader" color="#EFEC8F" height={6} speedMultiplier={1} width={107}/>
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
                    articleIsClicked={articleIsClicked}
                    clickedArticleId={clickedArticleId}
                    handleArticleHover={handleArticleHover}
                    handleArticleClick={handleArticleClick}
                    handleArticleClose={handleArticleClose}
                    //handleAddToCart={handleAddToCart}
                    articleRefs={articleRef}
                  />
                ));
              })()
            }
          </div>
        </div>
          
        {/*<div className="cart-icon" onClick={handleOpenCart}>
          <h1 className="cart-quantity">{addToCart.length}</h1>
          <svg viewBox="0 0 32 32">
            <title/>
            <g data-name="Layer 2" id="Layer_2">
              <path d="M23.52,29h-15a5.48,5.48,0,0,1-5.31-6.83L6.25,9.76a1,1,0,0,1,1-.76H24a1,1,0,0,1,1,.7l3.78,12.16a5.49,5.49,0,0,1-.83,
              4.91A5.41,5.41,0,0,1,23.52,29ZM8,11,5.11,22.65A3.5,3.5,0,0,0,8.48,27h15a3.44,3.44,0,0,0,2.79-1.42,3.5,3.5,0,0,0,.53-3.13L23.28,11Z"/>
              <path d="M20,17a1,1,0,0,1-1-1V8a3,3,0,0,0-6,0v8a1,1,0,0,1-2,0V8A5,5,0,0,1,21,8v8A1,1,0,0,1,20,17Z"/>
            </g>
          </svg>
        </div>*/}

        {/*cartVisible && 
        <div className="cart-container" ref={cartRef} style={{ opacity: 0 }}>
          <div className="bg-cart"></div>
          <h1 className="cart-title">TOTAL : {addToCart.reduce((total, item) => {
            const price = parseInt(item.price);
            const quantity = item.quantity || 1;
            return total + (price * quantity);
          }, 0)}€</h1>
          <h1 className="close-cart" onClick={handleCloseCart}>CLOSE</h1>
          <hr />
          <div className="cart-items">
            {addToCart.map((item) => (
              <div key={item.cartid} className="cart-item">
                <img src={item.images[0].image} alt={item.title} />
                <h2 className="cart-item-title">{item.title}</h2>
                <div className="cart-item-details">
                  <p>{item.price}€</p>
                  <h2 
                    className="remove-item" 
                    onClick={() => handleRemoveItem(item)}
                  >
                    REMOVE
                  </h2>
                </div>
              </div>
            ))}
          </div>
        </div>
        */}

        
        {isBooking ? (
          <div ref={bookingContainerRef} className="booking-container">
            <BookingCalendar type="product" />
            <button className="close-booking-button" onClick={() => setIsBooking(false)}>X</button>
          </div>
        ) : null}

        <Button screenRef={screenRef} labelRef={labelRef}/>
      </div>
      <h1 ref={labelRef} className="title-label" style={{color: labelColor}}>{label}</h1>
    </div>

  </>
  );
}

