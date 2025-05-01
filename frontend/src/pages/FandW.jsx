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

  const screenRef = useRef(null);
  const labelRef = useRef(null);
  const imageRef = useRef(null);
  const videoRef = useRef(null);
  const imageDiv1Ref = useRef(null);
  const imageDiv2Ref = useRef(null);
  const imageDiv3Ref = useRef(null);
  const imageDiv4Ref = useRef(null);
  const divRef = useRef(null);
  const bookButtonRef = useRef(null);

  const { 
    label, setLabel, 
    bgColor, 
    labelColor, setLabelColor, 
    setIsClicked, 
    mobileButtonsVisible, setMobileButtonsVisible,
    isMouseActive, setIsMouseActive,
    isBooking, setIsBooking
  } = useStore();

  const [images, setImages] = useState([]);
  const [imageIndex, setImageIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState('http://localhost:8000/media/store/F&W/watch1-wide-1.png');
  const [isBackgroundImage, setIsBackgroundImage] = useState(true);
  const [nextImageIndex, setNextImageIndex] = useState(null);
  const [hoveredDiv, setHoveredDiv] = useState(null);
  const mouseTimerRef = useRef(null);
  const preloadedImagesRef = useRef({});

  useEffect(() => {
    setIsClicked(false);
    setLabel("");
    setLabelColor(bgColor);
    setMobileButtonsVisible(false);
    setIsBooking(false);
  }, []);

  
  useEffect(() => {
    axios.get('http://localhost:8000/store/watches/')
      .then(response => {
        console.log("Données brutes de l'API:", response.data);
        const data = response.data;
        
        const imageArray = Object.values(data).map(image => ({
          watch1: [image.wide['1'], "watch1"],
          watch2: [image.wide['2'], "watch2"],
          watch3: [image.wide['3'], "watch3"],
          watch4: [image.wide['4'], "watch4"]
        }));
        
        console.log("Tableau final d'images:", imageArray);
        setImages(imageArray);
        
        // Précharge l'image suivante une fois que nous avons les données
        if (imageArray.length > 0) {
          preloadNextImages(0, imageArray);
        }
      })
      .catch(error => console.error('Erreur lors de la récupération des images:', error));
  }, []);
  
  // Précharge les images de l'index suivant et précédent
  const preloadNextImages = (currentIndex, imageArray = images) => {
    if (!imageArray.length) return;
    
    const nextIndex = (currentIndex + 1) % imageArray.length;
    const prevIndex = (currentIndex - 1 + imageArray.length) % imageArray.length;
    
    // Précharge les images de l'index suivant
    const preloadImage = (url) => {
      if (!url || url.endsWith('.webm') || url.endsWith('.mp4') || preloadedImagesRef.current[url]) return;
      
      const img = new Image();
      img.src = url;
      preloadedImagesRef.current[url] = true;
    };
    
    // Précharge les images de l'index suivant et précédent
    ['watch1', 'watch2', 'watch3', 'watch4'].forEach(key => {
      if (imageArray[nextIndex]?.[key]?.[0]) {
        preloadImage(imageArray[nextIndex][key][0]);
      }
      if (imageArray[prevIndex]?.[key]?.[0]) {
        preloadImage(imageArray[prevIndex][key][0]);
      }
    });
  };

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
      }, 500);
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

  // Handle mouse enter for all divs
  const handleMouseEnter = (imageDivRef, watch) => {
    setHoveredDiv(imageDivRef.current);
    watch === 'watch4' ? setIsBackgroundImage(false) : setIsBackgroundImage(true);
    setBackgroundImage(images[imageIndex]?.[watch][0] || '');
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

  const changeImage = (newIndex) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    const timeline = gsap.timeline({
      onComplete: () => {
        setIsAnimating(false);
        preloadNextImages(newIndex);
      }
    });
    
    timeline
      .to([imageRef.current, videoRef.current], {
        duration: 0.65,
        autoAlpha: 0,
        ease: "power3.inOut",
        onComplete: () => {
          setBackgroundImage(images[newIndex]?.watch1[0]);
          setIsBackgroundImage(true);
          setImageIndex(newIndex);
        }
      })
      .to([imageRef.current, videoRef.current], {
        duration: 0.45,
        autoAlpha: 1,
        ease: "power3.inOut"
      });
  };

  function handleImageIndexNext() {
    const newIndex = (imageIndex + 1) % images.length;
    changeImage(newIndex);
  };

  function handleImageIndexPrevious() {
    const newIndex = (imageIndex - 1 + images.length) % images.length;
    changeImage(newIndex);
  };

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
          <img ref={imageRef} src={backgroundImage || ''} alt="..." />
        ) : (
         <video 
          ref={videoRef}
          src={backgroundImage || ''} 
          autoPlay 
          loop 
          muted 
          style={{width: '100%', height: '100%', objectFit: 'cover'}} 
          />
        )}
        <div ref={divRef} className="fandw-div-container"
        >
          <>
            <div 
              ref={imageDiv1Ref} 
              className="top-left-div image-div"
              onMouseEnter={() => handleMouseEnter(imageDiv1Ref, 'watch1')}
              onMouseLeave={handleMouseLeave}
            >
            <img src={images[imageIndex]?.watch1[0] || ''} alt="..." loading="lazy" />
            </div>
            <div 
              ref={imageDiv2Ref} 
              className="top-right-div image-div"
              onMouseEnter={() => handleMouseEnter(imageDiv2Ref, 'watch2')}
              onMouseLeave={handleMouseLeave}
            >
              <img src={images[imageIndex]?.watch2[0] || ''} alt="..." loading="lazy" />
            </div>
            <div 
              ref={imageDiv3Ref} 
              className="bottom-left-div image-div"
              onMouseEnter={() => handleMouseEnter(imageDiv3Ref, 'watch3')}
              onMouseLeave={handleMouseLeave}
            >
              <img src={images[imageIndex]?.watch3[0] || ''} alt="..." loading="lazy" />
            </div>
            <div 
              ref={imageDiv4Ref} 
              className="bottom-right-div image-div"
              onMouseEnter={() => handleMouseEnter(imageDiv4Ref, 'watch4')}
              onMouseLeave={handleMouseLeave}
            >
              {images[imageIndex]?.watch4[0]?.endsWith('.webm') ? (
                <video 
                  src={images[imageIndex]?.watch4[0] || ''} 
                  autoPlay 
                  loop 
                  muted 
                  style={{width: '100%', height: '100%', objectFit: 'cover'}} 
                  preload="metadata"
                />
              ) : (
                <img src={images[imageIndex]?.watch4[0] || ''} alt="..." loading="lazy" />
              )}
            </div>
          </>
        </div>
        {isBooking ? (
          <div className="booking-container">
            <BookingCalendar currentWatch={`watch${imageIndex + 1}`} />
            <button className="close-booking-button" onClick={closeBooking}>X</button>
          </div>
        ) : null}

        <button className="next-button" onClick={handleImageIndexNext}>SUIVANT</button>
        <button className="previous-button" onClick={handleImageIndexPrevious}>PRÉCÉDENT</button>

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

