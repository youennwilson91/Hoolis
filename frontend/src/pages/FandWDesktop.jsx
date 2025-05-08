import Button from "../components/NavButtons";
import useStore from "../utils/store";
import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import "./FandW.scss";
import "../components/GalleryButtons.scss";
import BookingCalendar from "../components/Calendar";
import axios from "axios";
import FandWMobile from "./FandWMobile";


export default function FandW() {

  const { 
    label, setLabel, 
    bgColor, 
    labelColor, setLabelColor, 
    setIsClicked, 
    mobileButtonsVisible, setMobileButtonsVisible,
    isMouseActive, setIsMouseActive,
    isBooking, setIsBooking
  } = useStore();

  const [medias, setMedias] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState('http://192.168.1.184:8000/media/store/F%26W/watch1-wide-1.png');
  const [isBackgroundImage, setIsBackgroundImage] = useState(true);
  const [watchIndex, setWatchIndex] = useState(0);
  const [hoveredDiv, setHoveredDiv] = useState(null);

  const screenRef = useRef(null);
  const labelRef = useRef(null);
  const imageDivRef = useRef(null);
  const videoDivRef = useRef(null);
  const divRef = useRef(null);
  const nextButtonRef = useRef(null); 
  const previousButtonRef = useRef(null);
  const bookButtonRef = useRef(null);
  const bookingContainerRef = useRef(null);
  const mouseTimerRef = useRef(null);
  const preloadedImagesRef = useRef({});

  // Ajout d'une référence pour le cache
  const cacheRef = useRef({
    data: null,
    timestamp: null,
    expiryTime: 5 * 60 * 1000 // 5 minutes en millisecondes
  });

  useEffect(() => {
    setIsClicked(false);
    setLabel("");
    setLabelColor(bgColor);
    setMobileButtonsVisible(false);
    setIsBooking(false);
  }, []);

  useEffect(() => {
    const fetchWatches = async () => {
      let retries = 3; // Nombre de tentatives

      try {
        const response = await axios.get('http://192.168.1.184:8000/store/watches/');
        const watches = response.data.results;

        if (watches.length > 0) {
          const formattedWatches = watches.map(watch => ({
            id: watch.id,
            name: watch.name,
            description: watch.description,
            wide: watch.images.filter(img => img.size === 'wide')
          }));
          
          cacheRef.current.data = formattedWatches;
          cacheRef.current.timestamp = Date.now();
          setMedias(formattedWatches);
        }
      } catch (error) {
        if (retries > 0) {
          retries--;
          await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre 1 seconde
          fetchWatches(); // Réessayer
        } else {
          console.error('Erreur lors de la récupération des images:', error);
        }
      }
    };

    fetchWatches();
  }, []);
  

  // Mouse activity tracker
  useEffect(() => {
    const handleMouseMove = () => {
      setIsMouseActive(true);
      
      // Clear any existing timer
      if (mouseTimerRef.current) {
        clearTimeout(mouseTimerRef.current);
      }
      
      // Set new timer for inactivity
      mouseTimerRef.current = setTimeout(() => {
        setIsMouseActive(false);
      }, 1000);
    };
    
    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseMove);
    
    // Initialize the timer
    handleMouseMove();
    
    // Clean up
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseMove);
      if (mouseTimerRef.current) {
        clearTimeout(mouseTimerRef.current);
      }
    };
  }, []);

  // Effect to update button opacity based on mouse activity
  useGSAP(() => {
    if (bookButtonRef.current) {
      gsap.to(bookButtonRef.current,  {
        duration: 0.25,
        autoAlpha: isMouseActive ? 0.8 : 0,
        ease: "power2.inOut"
      })
    }
    if (divRef.current) {
      gsap.to(divRef.current, {
        duration: 0.25,
        autoAlpha: isMouseActive ? 0.8 : 0, 
        ease: "power2.inOut"
      });
    } 
    if (nextButtonRef.current) {
      gsap.to(nextButtonRef.current, {
        duration: 0.25,
        autoAlpha: isMouseActive ? 0.8 : 0,
        ease: "power2.inOut"
      });
    }
    if (previousButtonRef.current) {
      gsap.to(previousButtonRef.current, {
        duration: 0.25,
        autoAlpha: isMouseActive ? 0.8 : 0,
        ease: "power2.inOut"
      });
    }
  }, [isMouseActive]); 

  

  useGSAP(() => {
    gsap.to(screenRef.current, {
      duration: 0.75,
      ease: "power3.inOut",
      opacity: 1
    });
  }, []);


  // Animation for hover effect
  useGSAP(() => {
    if (hoveredDiv) {
      // Create neon effect when hovering
      gsap.to(hoveredDiv, {
        duration: 0.25,
        boxShadow: "0 0 10px rgba(255, 255, 255, 0.9), 0 0 20px rgba(255, 255, 255, 0.7), 0 0 30px rgba(255, 255, 255, 0.5)",
        border: "2px solid rgba(255, 255, 255, 1)",
        ease: "power2.inOut"
      });
    }
  }, [hoveredDiv]);

    // Animation pour le conteneur de réservation
    useGSAP(() => {
      if (bookingContainerRef.current) {
        if (isBooking) {
          gsap.to(bookingContainerRef.current, {
            duration: 0.75,
            ease: "power3.inOut",
            opacity: 1
          });
        } else {
          gsap.to(bookingContainerRef.current, {
            duration: 0.75,
            ease: "power3.inOut",
            opacity: 0
          });
        }
      }
    }, [isBooking]);

  // Handle mouse enter for all divs
  const handleMouseEnter = (media, event) => {
    setHoveredDiv(event.currentTarget);
    media.type === 'image' ? setIsBackgroundImage(true) : setIsBackgroundImage(false);
    setBackgroundImage(media.media || '');
  };

  // Handle mouse leave for all divs
  const handleMouseLeave = () => {
    if (hoveredDiv) {
      gsap.to(hoveredDiv, {
        duration: 0.5,
        boxShadow: "0 0 0px transparent",
        border: "1px solid rgba(255, 255, 255, 0.7)",
        ease: "power2.inOut"
      });
      setHoveredDiv(null);
    }
  };

  // Précharge les images de l'index suivant et précédent
  const preloadNextImages = (currentIndex) => {
    if (!medias.length) return;
    
    const nextIndex = (currentIndex + 1) % medias.length;
    const prevIndex = (currentIndex - 1 + medias.length) % medias.length;
    
    // Précharge les images
    const preloadImage = (url) => {
      if (!url || url.endsWith('.webm') || url.endsWith('.mp4') || preloadedImagesRef.current[url]) return;
      
      const img = new Image();
      img.src = url;
      preloadedImagesRef.current[url] = true;
    };
    
    // Précharge les images de la montre suivante et précédente
    if (medias[nextIndex]?.wide) {
      medias[nextIndex].wide.forEach(media => {
        if (media.type === 'image') {
          preloadImage(media.media);
        }
      });
    }
    
    if (medias[prevIndex]?.wide) {
      medias[prevIndex].wide.forEach(media => {
        if (media.type === 'image') {
          preloadImage(media.media);
        }
      });
    }
  };

  useEffect(() => {
    if (medias.length > 0) {
      preloadNextImages(watchIndex);
    }
  }, [medias, watchIndex]);

  // Modifier la fonction mediaDiv pour enlever le lazy loading
  function mediaDiv(media, index) {
    return (
      <>
        {media.type === 'video' ? (
          <div 
            key={`${index}`} 
            className="media-div"
            onMouseEnter={(event) => handleMouseEnter(media, event)}
            onMouseLeave={handleMouseLeave}
          >
            <video 
              src={media.media} 
              autoPlay 
              loop 
              muted 
              preload="metadata"
            />
          </div>
        ) : (
          <div 
            key={`${index}`}
            className="media-div"
            onMouseEnter={(event) => handleMouseEnter(media, event)}
            onMouseLeave={handleMouseLeave}
          >
            <img 
              src={media.media} 
              alt={media.name || 'Montre'} 
            />
          </div>
        )}
      </>
    );
  }

  const changeImage = (newIndex) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    const timeline = gsap.timeline({
      onComplete: () => {
        setIsAnimating(false);
      }
    });
    
    // Utiliser simplement un élément qui existe forcément (screenRef)
    timeline
      .to(screenRef.current, {
        duration: 0.65,
        autoAlpha: 0,
        ease: "power3.inOut",
        onComplete: () => {
          // Utiliser l'URL de la première image wide de la montre si disponible
          const nextWatch = medias[newIndex];
          if (nextWatch && nextWatch.wide && nextWatch.wide.length > 0) {
            setBackgroundImage(nextWatch.wide[0].media);
            setIsBackgroundImage(nextWatch.wide[0].type === 'image');
          }
          setWatchIndex(newIndex);
        }
      })
      .to(screenRef.current, {
        duration: 0.45,
        autoAlpha: 1,
        ease: "power3.inOut"
      });
  };

  function handleNextWatch() {
    if (!medias || medias.length === 0) return;
    const newIndex = (watchIndex + 1) % medias.length;
    changeImage(newIndex);
  }

  function handlePreviousWatch() {
    if (!medias || medias.length === 0) return;
    const newIndex = (watchIndex - 1 + medias.length) % medias.length;
    changeImage(newIndex);
  }

  function handleBooking() {
    setIsBooking(true);
  }

  function closeBooking() {
    setIsBooking(false);
  }



  return (
  <>

    <div ref={screenRef} className="fandw-container">
      <div className="fandw-landing">
        {isBackgroundImage ? (
          <img ref={imageDivRef} src={backgroundImage || ''} alt="Image de fond de la section F&W" />
        ) : (
         <video 
          ref={videoDivRef}
          src={backgroundImage || ''} 
          autoPlay 
          loop 
          muted 
          style={{width: '100%', height: '100%', objectFit: 'cover'}} 
          />
        )}
        <div ref={divRef} className="fandw-div-container">
          {medias[watchIndex]?.wide && medias[watchIndex].wide.map((media, index) => mediaDiv(media, index))}
        </div>
        {isBooking ? (
          <div ref={bookingContainerRef} className="booking-container">
            <BookingCalendar currentWatch={`watch${watchIndex + 1}`} />
            <button className="close-booking-button" onClick={closeBooking}>X</button>
          </div>
        ) : null}

        <button ref={nextButtonRef} className="next-button" onClick={handleNextWatch}>SUIVANT</button>
        <button ref={previousButtonRef} className="previous-button" onClick={handlePreviousWatch}>PRÉCÉDENT</button>

        {!isBooking ? <button 
          ref={bookButtonRef} 
          className="button-book" 
          onClick={handleBooking}
        >
          PRENDRE RENDEZ-VOUS
        </button> : null}
      </div>
      <h1 ref={labelRef} className="title-label" style={{color: labelColor}}>{label}</h1>
      <Button screenRef={screenRef} labelRef={labelRef}/>
    </div>

    {/*------------------------------------------- MOBILE -------------------------------------------*/}

    <FandWMobile />

  </>
  );
}

