import MenuButtons from "../components/Buttons/MenuMobile.jsx";
import useStore from "../utils/store";
import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import "./Shop.scss";
import BookingCalendar from "../components/Calendar";
import { BarLoader } from "react-spinners";
import { apiClient, API_ENDPOINTS } from "../utils/axiosConfig";
import { sanitizeError, sanitizeProduct, sanitizeImageUrl, sanitizeAltText } from "../utils/sanitizer";

export default function ShopMobile({ labelRef, handleAddToCart, handleRemoveItem }) {
  const mobileScreenRef = useRef(null);
  const mobileCartRef = useRef(null);
  const bookingContainerRef = useRef(null);
  const bookButtonRef = useRef(null);
  const articlesContainerRef = useRef(null);
  
  const { 
    cartVisible, setCartVisible, 
    addToCart,
    products, setProducts,
    isBooking, setIsBooking
  } = useStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsBooking(false);
  }, []);

  // Fonction de gestion d'erreur sécurisée
  const handleError = (error) => {
    let errorMessage = "Une erreur est survenue";
    let statusCode = null;

    if (error.response) {
      statusCode = error.response.status;
      // Utiliser notre fonction de sanitisation
      errorMessage = sanitizeError(error.response.data?.error || error.message, statusCode);
    } else if (error.request) {
      errorMessage = "Service temporairement indisponible";
    } else {
      errorMessage = "Erreur de connexion";
    }

    setError(errorMessage);
  };

  // Récupération des produits depuis l'API
  useEffect(() => {
    console.log("Tentative de connexion à l'API...");
    setLoading(true);
    setError(null);
    
    console.log("URL API utilisée:", `${apiClient.defaults.baseURL}${API_ENDPOINTS.products}`);
    
    apiClient.get(API_ENDPOINTS.products)
      .then(response => {
        console.log("Données brutes de l'API:", response.data);
        let productsData = response.data.results;
        
        if (productsData && Array.isArray(productsData)) {
          // Sanitiser chaque produit avant de les stocker
          const sanitizedProducts = productsData.map(product => sanitizeProduct(product));
          setProducts(sanitizedProducts);
          console.log("✅ Produits récupérés:", sanitizedProducts.length);
        } else {
          console.log("⚠️ Aucun produit trouvé");
          setProducts([]);
          setLoading(false);
        }
      })
      .catch(error => {
        console.error('Erreur lors de la requête:', error.message);
        handleError(error);
        setProducts([]);
        setLoading(false);
      });
  }, []);

  // Function to preload all product images
  const preloadAllImages = () => {
    if (!Array.isArray(products) || products.length === 0) {
      setLoading(false);
      return;
    }

    const imagePromises = [];
    
    products.forEach(article => {
      if (article.images && article.images.length > 0) {
        article.images.forEach(imageObj => {
          if (imageObj.image) {
            const promise = new Promise((imgResolve) => {
              const img = new Image();
              img.onload = () => imgResolve();
              img.onerror = () => imgResolve(); // Resolve even on error to avoid blocking
              img.src = sanitizeImageUrl(imageObj.image); // Sanitiser l'URL
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

  // Preload images when products change
  useEffect(() => {
    if (products && products.length > 0) {
      preloadAllImages();
    }
  }, [products]);

  useGSAP(() => {
    gsap.to(mobileScreenRef.current, {
      duration: 0.35,
      ease: "power3.inOut",
      opacity: 1
    });
  }, []);

  // Animation for articles container based on products (like FandWMobile)
  useGSAP(() => {
    if (articlesContainerRef.current) {
      gsap.to(articlesContainerRef.current, {
        duration: 0.40,
        ease: "power3.inOut",
        opacity: 1
      });
    }
  }, [products]);

  useGSAP(() => {
    if (bookingContainerRef.current && isBooking) {
      gsap.to(bookingContainerRef.current, {
        duration: 0.40,
        ease: "power3.inOut",
        opacity: 1
      });
    }
  }, [isBooking]);

  function handleOpenMobileCart() {
    setCartVisible(true);
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
          if (mobileCartRef.current) {
            mobileCartRef.current.style.opacity = 0;
          }
        }
      });
    }
  }

  return (
    <div ref={mobileScreenRef} className="mobile-shop-container">
      <div ref={articlesContainerRef} className="mobile-shop-articles">
        {error && <div style={{color: 'white', padding: '20px', backgroundColor: 'rgba(0,0,0,0.7)', margin: '10px'}}>{error}</div>}
        
        {loading && <BarLoader className="loader" color="#EFEC8F" height={6} speedMultiplier={1} width={107}/>}
        
        {!loading && Array.isArray(products) && products.length > 0 ? (
          products.map((article) => (
            <div key={article.id} className="mobile-shop-article">
              <div className="mobile-shop-article-image-container">
                <img 
                  src={sanitizeImageUrl(article.images?.[0]?.image)} 
                  alt={sanitizeAltText(`${article.title || 'Produit'} - Vue principale - Collection Hoolis`)}
                  loading="lazy"
                  decoding="async"
                  style={{ backgroundColor: '#f0f0f0' }}
                />
                <img 
                  src={sanitizeImageUrl(article.images?.[1]?.image)} 
                  alt={sanitizeAltText(`${article.title || 'Produit'} - Vue détaillée - Collection Hoolis`)}
                  loading="lazy"
                  decoding="async"
                  style={{ backgroundColor: '#f0f0f0' }}
                />

                <div className="mobile-shop-article-details">
                  <h1>{article.title}</h1>
                  <h1>{article.price}€</h1>
                </div>
              </div>
            </div>
          ))
        ) : !loading && (
          <div style={{color: 'white', padding: '20px'}}>Aucun produit trouvé</div>
        )}

        <div className="cart-icon" onClick={handleOpenMobileCart}>
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
        <div className="cart-container" ref={mobileCartRef} style={{ opacity: 0 }}>
          <div className="bg-cart"></div>
          <button className="close-cart" onClick={handleCloseMobileCart}>CLOSE</button>
          <div className="cart-items">
            {addToCart.map((item) => (
              <div key={item.cartid} className="cart-item">
                <img src={item.images[0].image} alt={item.title} />
                <h2 className="cart-item-title">{item.title}</h2>
                <div className="cart-item-details">
                  <p>{item.price}</p>
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
          <h1 className="cart-title">TOTAL : {addToCart.reduce((total, item) => {
            const price = parseInt(item.price);
            const quantity = item.quantity || 1;
            return total + (price * quantity);
          }, 0)}€</h1>
        </div>
        }
      </div>

      {/*{!isBooking ? 
        <button ref={bookButtonRef} className="button-book" onClick={() => setIsBooking(true)}>
          PRENDRE RENDEZ-VOUS
        </button> : null}*/}

      {/*{isBooking ? (
        <div ref={bookingContainerRef} className="booking-container">
          <BookingCalendar type="product" />
          <button className="close-booking-button" onClick={() => setIsBooking(false)}>X</button>
        </div>
      ) : null}*/}
      
      <MenuButtons screenRef={mobileScreenRef} />
    </div>
  );
} 