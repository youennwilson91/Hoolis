import Button from "../components/NavButtons";
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
  
  const { isBooking, setIsBooking } = useStore();
  const [medias, setMedias] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
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
              {media.small && media.small.length > 0 && media.small.map((m, imgIndex) => (
                <img 
                  className="mobile-fandw-watch"
                  key={m.id}
                  src={sanitizeImageUrl(m.media)}
                  alt={sanitizeAltText(m.name || `Montre ${media.name}`)}
                  loading="lazy"
                  decoding="async"
                />
              ))}

              <div className="mobile-fandw-watch-details">
                <h1>{media.name}</h1>
                <p>{media.description}</p>
              </div>
            </div>
          ))
        ) : !loading && (
          <div style={{color: 'white', padding: '20px'}}>Aucune montre trouvée</div>
        )}
      </div>
      
      
      {!isBooking ? (
        <button 
          ref={bookButtonRef} 
          className="button-book" 
          onClick={handleBooking}
        >
          PRENDRE RENDEZ-VOUS
        </button>
      ) : null}

      {isBooking ? (
        <div ref={bookingContainerRef} className="booking-container">
          <BookingCalendar type="watches" />
          <button className="close-booking-button" onClick={closeBooking}>×</button>
        </div>
      ) : null}

      <Button screenRef={mobileScreenRef} labelRef={labelRef} />

    </div>
  );
} 