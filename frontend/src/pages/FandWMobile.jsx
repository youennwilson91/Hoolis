import Button from "../components/NavButtons";
import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import useStore from "../utils/store";
import "./FandW.scss";
import axios from "axios";
import BookingCalendar from "../components/Calendar";

export default function FandWMobile({ labelRef }) {
  const mobileScreenRef = useRef(null);
  const bookButtonRef = useRef(null);
  const bookingContainerRef = useRef(null);

  const { isBooking, setIsBooking } = useStore();
  const [medias, setMedias] = useState([]);
  
  useEffect(() => {
    setIsBooking(false);
  }, []);

  useEffect(() => {
    axios.get('http://localhost:8000/store/watches/')
      .then(response => {
        console.log("Données brutes de l'API:", response.data);
        const watches = response.data.results;

        // Structure organisée des médias par montre
        if (watches && watches.length > 0) {
        const formattedWatches = watches.map(watch => ({
          id: watch.id,
          name: watch.name,
          description: watch.description,
          small: watch.images.filter(img => img.size === 'small'),
        }));
        
        console.log("Montres formatées:", formattedWatches);
        setMedias(formattedWatches);
      } else {
        console.log("Aucune montre trouvée dans l'API.");
      }
    })
      .catch(error => console.error('Erreur lors de la récupération des images:', error));
  }, []);
  

  useGSAP(() => {
    gsap.to(mobileScreenRef.current, {
      backgroundColor: "#D6955B",
      duration: 0.75,
      ease: "power3.inOut",
      opacity: 1
    });
  }, []);

  // Animation du bouton de réservation
  useGSAP(() => {
    if (bookButtonRef.current) {
      gsap.to(bookButtonRef.current, {
        duration: 0.25,
        ease: "power2.inOut"
      });
    }
  }, []);

  // Animation du conteneur de réservation
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
      <div className="mobile-fandw-watches">
        {medias && medias.length > 0 ? (
          medias.map((media) => (
            <div key={media.id} className="mobile-fandw-watch">
              <div className="mobile-fandw-watch-image-container">
                {media.small && media.small.length > 0 ? media.small.map((m) => (
                  m.type === 'image' ? (
                    <img key={m.id} src={m.media} alt={m.name} />
                  ) : (
                    <video key={m.id} src={m.media} autoPlay loop muted style={{width: '100%', height: '100%', objectFit: 'cover'}} alt={`Vidéo ${m.name}`} />
                  )
                )) : null}
          
                <div className="mobile-fandw-watch-details">
                  <h1>{media.name}</h1>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div>Loading products...</div>
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
          <BookingCalendar />
          <button className="close-booking-button" onClick={closeBooking}>×</button>
        </div>
      ) : null}

      <Button screenRef={mobileScreenRef} labelRef={labelRef} />

    </div>
  );
} 