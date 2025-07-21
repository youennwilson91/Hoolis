import MenuButtons from "../components/Buttons/MenuMobile.jsx";
import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import useStore from "../utils/store";
import "./FandW.scss";
import { apiClient, API_ENDPOINTS } from "../utils/axiosConfig";
import BookingCalendar from "../components/Calendar";
import { BarLoader } from "react-spinners";
import { sanitizeError, sanitizeProduct, sanitizeImageUrl, sanitizeAltText, sanitizeText } from "../utils/sanitizer";

export default function FandWMobile({ labelRef }) {
  const mobileScreenRef = useRef(null);
  const bookButtonRef = useRef(null);
  const bookingContainerRef = useRef(null);
  const watchesContainerRef = useRef(null);
  
  const { isBooking, setIsBooking, addToCart, setCartVisible, setAddToCart } = useStore();
  const [medias, setMedias] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDescription, setShowDescription] = useState(false);
  const [selectedWatch, setSelectedWatch] = useState(null);
  
  useEffect(() => {
    setIsBooking(false);
  }, []);

  // Fonction de gestion d'erreur sécurisée
  const handleError = (error) => {
    let errorMessage = "Une erreur est survenue";
    let statusCode = null;

    if (error.response) {
      statusCode = error.response.status;
      errorMessage = sanitizeError(error.response.data?.error || error.message, statusCode);
    } else if (error.request) {
      errorMessage = "Service temporairement indisponible";
    } else {
      errorMessage = "Erreur de connexion";
    }

    setError(errorMessage);
  };

  function preloadWatchImages() {
    if (!Array.isArray(medias) || medias.length === 0) {
      setLoading(false);
      return;
    }

    const imagePromises = [];
    
    medias.forEach(watch => {
      if (watch.small && watch.small.length > 0) {
        watch.small.forEach(media => {
          if (media.type === 'image' && media.media) {
            const promise = new Promise((imgResolve) => {
              const img = new Image();
              img.onload = () => imgResolve();
              img.onerror = () => imgResolve(); // Resolve even on error to avoid blocking
              img.src = sanitizeImageUrl(media.media); // Sanitiser l'URL
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

  // Appels API simple sans cache
  useEffect(() => {
    console.log("Tentative de connexion à l'API...");
    setLoading(true);
    setError(null);
    
    console.log("URL API utilisée:", `${apiClient.defaults.baseURL}${API_ENDPOINTS.watches}`);
    
    apiClient.get(API_ENDPOINTS.watches)
      .then(response => {
        console.log("Données brutes de l'API:", response.data);
        const watches = response.data.results;

        if (watches && watches.length > 0) {
          const formattedWatches = watches.map(watch => ({
            id: watch.id,
            name: sanitizeText(watch.name), // Sanitiser le nom
            description: sanitizeText(watch.description), // Sanitiser la description
            price: watch.price || 0, // Ajouter le prix
            small: watch.images.filter(img => img.size === 'small'),
          }));
          
          console.log("Montres formatées:", formattedWatches);
          setMedias(formattedWatches);
        } else {
          console.log("Aucune montre trouvée dans l'API");
          setMedias([]);
          setLoading(false);
        }
      })
      .catch(error => {
        console.error('Erreur lors de la requête:', error.message);
        handleError(error);
        setMedias([]);
        setLoading(false);
      });
  }, []);

  // Preload images when medias change
  useEffect(() => {
    if (medias && medias.length > 0) {
      preloadWatchImages();
    }
  }, [medias]);
  

  useGSAP(() => {
    gsap.to(mobileScreenRef.current, {
      backgroundColor: "#000000",
      duration: 0.35,
      ease: "power3.inOut",
      opacity: 1
    });
  }, []);

  useGSAP(() => {
    if (bookButtonRef.current) {
      gsap.to(bookButtonRef.current, {
        duration: 0.25,
        ease: "power2.inOut"
      });
    }
  }, []);

  useGSAP(() => {
    if (watchesContainerRef.current) {
      gsap.to(watchesContainerRef.current, {
        duration: 0.40,
        ease: "power3.inOut",
        opacity: 1
      });
    }
  }, [medias]);

  useGSAP(() => {
    if (bookingContainerRef.current && isBooking) {
      gsap.to(bookingContainerRef.current, {
        duration: 0.40,
        ease: "power3.inOut",
        opacity: 1
      });
    }
  }, [isBooking]);

  function handleBooking() {
    setIsBooking(true);
  }

  function closeBooking() {
    setIsBooking(false);
  }

  // Fonction pour ajouter une montre au panier
  const handleAddToCart = (watch) => {
    // Créer un objet similaire aux produits pour le panier
    const cartItem = {
      id: `watch_${watch.id}`,
      cartid: `watch_${Date.now()}_${watch.id}`,
      title: watch.name,
      price: watch.price || 0, // Utiliser le prix réel de la montre
      images: watch.small?.length > 0 ? [{ image: watch.small[0].media }] : [],
      type: 'watch',
      quantity: 1
    };
    
    // Utiliser le store pour ajouter au panier
    setAddToCart((currentCart) => [...currentCart, cartItem]);
    console.log("Montre ajoutée au panier:", cartItem);
  };

  return (
    <div ref={mobileScreenRef} className="mobile-fandw-container">
      <div ref={watchesContainerRef} className="mobile-fandw-watches" style={{ opacity: 0 }}>
        {error && <div style={{color: 'white', padding: '20px', backgroundColor: 'rgba(0,0,0,0.7)', margin: '10px'}}>{error}</div>}
        
        {loading && <BarLoader className="loader" color="#EFEC8F" height={6} speedMultiplier={1} width={107}/>}
        
        {!loading && medias && medias.length > 0 ? (
          medias.map((media) => (
            <div 
              key={media.id}
              className="mobile-fandw-watch-container"
            >
              <div className="mobile-fandw-watch-image-container">
                {media.small && media.small.length > 0 ? media.small.map((m, imgIndex) => (
                  <img 
                    className="mobile-fandw-watch"
                    key={m.id}
                    src={sanitizeImageUrl(m.media)}
                    alt={sanitizeAltText(m.name || `Montre ${media.name}`)}
                    loading="lazy"
                    decoding="async"
                  />
                )) : (
                  <img 
                    key={media.id}
                    src={sanitizeImageUrl(media.small?.[0]?.media)}
                    className="mobile-fandw-watch"
                    loading="lazy"
                    decoding="async"
                    alt={sanitizeAltText(media.name || 'Montre de luxe')}
                  />
                )}

                <div className="mobile-fandw-watch-details">
                  <h1>{media.name}</h1>
                  <h1>{media.price}€</h1>
                  
                  {/* Boutons d'action avec icônes */}
                  <div className="mobile-article-action-buttons">
                    <button 
                      className="action-button cart-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(media);
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
                        setSelectedWatch(media);
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
          <div style={{color: 'white', padding: '20px'}}>Aucune montre trouvée</div>
        )}
      </div>
      
      {/* Calendrier de booking */}
      {isBooking && (
        <div ref={bookingContainerRef} className="booking-container" style={{ opacity: 0 }}>
          <BookingCalendar type="watches" />
          <button className="close-booking-button" onClick={() => setIsBooking(false)}>×</button>
        </div>
      )}

      {/* Popup de description pour mobile */}
      {showDescription && selectedWatch && (
        <div className="mobile-description-popup-overlay" onClick={() => setShowDescription(false)}>
          <div className="mobile-description-popup" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedWatch.name}</h3>
            <p>{selectedWatch.description}</p>
            <button className="mobile-close-popup-btn" onClick={() => setShowDescription(false)}>
              Fermer
            </button>
          </div>
        </div>
      )}

      <MenuButtons screenRef={mobileScreenRef} />

    </div>
  );
} 