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
  const [showDescription, setShowDescription] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

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
                  
                  {/* Boutons d'action avec icônes */}
                  <div className="mobile-article-action-buttons">
                    <button 
                      className="action-button cart-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(article, e);
                      }}
                      aria-label="Ajouter au panier"
                    >
                      <svg viewBox="0 0 453.73 453.73" className="action-icon">
                        <path d="M447.664,129.262c-5.005-6.031-12.435-9.521-20.271-9.521h-20.86l4.734-4.733c1.641-1.642,2.562-3.867,2.562-6.188
                          c0-2.321-0.922-4.547-2.562-6.188l-48.674-48.673c-3.415-3.417-8.956-3.416-12.375,0.001l-56.886,56.887v-50.7
                          c0-4.832-3.918-8.75-8.75-8.75H174.265c-4.832,0-8.75,3.918-8.75,8.75v59.511c0,0.028,0.004,0.056,0.004,0.083h-34.664
                          l-2.876-14.948c-1.838-9.543-8.78-17.301-18.063-20.18L34.149,61.111C20.257,56.802,5.5,64.571,1.189,78.465
                          c-4.31,13.894,3.461,28.65,17.354,32.96l60.689,18.824l46.254,202.948c1.612,8.584,7.281,15.535,14.797,19.027
                          c-0.223,1.806-0.352,3.639-0.352,5.501c0,24.599,20.013,44.609,44.61,44.609c24.597,0,44.61-20.012,44.61-44.609
                          c0-1.026-0.047-2.042-0.117-3.052h70.424c-0.067,1.01-0.115,2.024-0.115,3.052c0,24.599,20.012,44.609,44.608,44.609
                          c24.599,0,44.609-20.012,44.609-44.609c0-1.101-0.054-2.187-0.132-3.267c11.271-1.366,20.564-9.866,22.704-21.263l42.145-182.255
                          C454.726,143.239,452.667,135.293,447.664,129.262z"/>
                      </svg>
                    </button>
                    
                    <button 
                      className="action-button calendar-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsBooking(true);
                      }}
                      aria-label="Prendre rendez-vous"
                    >
                      <svg viewBox="0 0 612 612" className="action-icon">
                        <path d="M612,463.781c0-70.342-49.018-129.199-114.75-144.379c-10.763-2.482-21.951-3.84-33.469-3.84
                          c-3.218,0-6.397,0.139-9.562,0.34c-71.829,4.58-129.725,60.291-137.69,131.145c-0.617,5.494-0.966,11.073-0.966,16.734
                          c0,10.662,1.152,21.052,3.289,31.078C333.139,561.792,392.584,612,463.781,612C545.641,612,612,545.641,612,463.781z
                          M463.781,561.797c-54.133,0-98.016-43.883-98.016-98.016s43.883-98.016,98.016-98.016s98.016,43.883,98.016,98.016
                          S517.914,561.797,463.781,561.797z"/>
                        <polygon points="482.906,396.844 449.438,396.844 449.438,449.438 396.844,449.438 396.844,482.906 482.906,482.906 
                          482.906,449.438 482.906,449.438"/>
                      </svg>
                    </button>
                    
                    <button 
                      className="action-button info-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProduct(article);
                        setShowDescription(true);
                      }}
                      aria-label="Voir la description"
                    >
                      <svg viewBox="0 0 416.979 416.979" className="action-icon">
                        <path d="M356.004,61.156c-81.37-81.47-213.377-81.551-294.848-0.182c-81.47,81.371-81.552,213.379-0.181,294.85
                          c81.369,81.47,213.378,81.551,294.849,0.181C437.293,274.636,437.375,142.626,356.004,61.156z M237.6,340.786
                          c0,3.217-2.607,5.822-5.822,5.822h-46.576c-3.215,0-5.822-2.605-5.822-5.822V167.885c0-3.217,2.607-5.822,5.822-5.822h46.576
                          c3.215,0,5.822,2.604,5.822,5.822V340.786z M208.49,137.901c-18.618,0-33.766-15.146-33.766-33.765
                          c0-18.617,15.147-33.766,33.766-33.766c18.619,0,33.766,15.148,33.766,33.766C242.256,122.755,227.107,137.901,208.49,137.901z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : !loading && (
          <div style={{color: 'white', padding: '20px'}}>Aucun produit trouvé</div>
        )}

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
          <h1 className="cart-title">TOTAL : {addToCart.reduce((total, item) => {
            const price = parseInt(item.price);
            const quantity = item.quantity || 1;
            return total + (price * quantity);
          }, 0)}€</h1>
        </div>
                }
      </div>

      {/* Icône du panier fixe - en dehors du conteneur scrollable */}
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

      {/* Calendrier de booking */}
      {isBooking && (
        <div ref={bookingContainerRef} className="booking-container" style={{ opacity: 0 }}>
          <BookingCalendar type="product" />
        </div>
      )}

      <MenuButtons screenRef={mobileScreenRef} />
      
      {/* Popup de description pour mobile */}
      {showDescription && selectedProduct && (
        <div className="mobile-description-popup-overlay" onClick={() => setShowDescription(false)}>
          <div className="mobile-description-popup" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedProduct.title}</h3>
            <p>{selectedProduct.description}</p>
            <button className="mobile-close-popup-btn" onClick={() => setShowDescription(false)}>
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 