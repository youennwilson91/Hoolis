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
import OrderForm from "../components/OrderForm";

export default function FandWMobile({ labelRef }) {
  const mobileScreenRef = useRef(null);
  const bookButtonRef = useRef(null);
  const bookingContainerRef = useRef(null);
  const watchesContainerRef = useRef(null);
  
  const { isBooking, setIsBooking } = useStore();
  const [medias, setMedias] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDescription, setShowDescription] = useState(false);
  const [selectedWatch, setSelectedWatch] = useState(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedWatchForOrder, setSelectedWatchForOrder] = useState(null);
  
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

  // Fonction pour ouvrir le formulaire de commande
  const handleAddToCart = (watch) => {
    const sanitizedWatch = {
      id: watch.id,
      name: sanitizeText(watch.name || ''),
      description: sanitizeText(watch.description || ''),
      price: watch.price || 0,
      wide: watch.wide || []
    };
    
    setSelectedWatchForOrder(sanitizedWatch);
    setShowOrderForm(true);
    console.log("Ouverture du formulaire de commande pour:", sanitizedWatch.name);
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
                      aria-label="Commander cette montre"
                    >
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width: '45px', height: '45px'}}>
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M2 8C2 5.79086 3.79086 4 6 4H18C20.2091 4 22 5.79086 22 8V8.5C22 8.77614 21.7761 9 21.5 9L2.5 9C2.22386 9 2 8.77614 2 8.5V8ZM2.5 11C2.22386 11 2 11.2239 2 11.5V16C2 18.2091 3.79086 20 6 20H18C20.2091 20 22 18.2091 22 16V11.5C22 11.2239 21.7761 11 21.5 11L2.5 11ZM13 15C13 14.4477 13.4477 14 14 14H17C17.5523 14 18 14.4477 18 15C18 15.5523 17.5523 16 17 16H14C13.4477 16 13 15.5523 13 15Z" fill="currentColor"/>
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
                      <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style={{width: '45px', height: '45px'}}>
                        <path d="M23,18H20V15a1,1,0,0,0-2,0v3H15a1,1,0,0,0,0,2h3v3a1,1,0,0,0,2,0V20h3a1,1,0,0,0,0-2Z
                        M11,7v4.586L8.293,14.293a1,1,0,1,0,1.414,1.414l3-3A1,1,0,0,0,13,12V7a1,1,0,0,0-2,0Z
                        M14.728,21.624a9.985,9.985,0,1,1,6.9-6.895,1,1,0,1,0,1.924.542,11.989,11.989, 0,1,0-8.276,8.277,1,1,0,1,0-.544-1.924Z"/>
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
                      <svg viewBox="0 0 416.979 416.979" className="action-icon" style={{width: '45px', height: '45px'}}>
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

      {/* Composant OrderForm pour les commandes de montres */}
      {selectedWatchForOrder && (
        <OrderForm 
          item={selectedWatchForOrder}
          isOpen={showOrderForm}
          onClose={() => {
            setShowOrderForm(false);
            setSelectedWatchForOrder(null);
          }}
        />
      )}

      <MenuButtons screenRef={mobileScreenRef} />

    </div>
  );
} 