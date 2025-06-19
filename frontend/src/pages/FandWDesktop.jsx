import Button from "../components/NavButtons";
import useStore from "../utils/store";
import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import "./FandW.scss";
import "../components/GalleryButtons.scss";
import BookingCalendar from "../components/Calendar";
import { apiClient, API_ENDPOINTS } from "../utils/axiosConfig";
import { BarLoader } from "react-spinners";
import Watch from "../components/Watch";


export default function FandW() {

  const { 
    label, setLabel, 
    bgColor, 
    labelColor, setLabelColor, 
    setIsClicked, 
    mobileButtonsVisible, setMobileButtonsVisible,
    isMouseActive, setIsMouseActive,
    isBooking, setIsBooking,
    setIsMobile,
    watches, setWatches
  } = useStore();

  const [medias, setMedias] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [watchIndex, setWatchIndex] = useState(0);
  const [hoveredDiv, setHoveredDiv] = useState(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  const [loading, setLoading] = useState(false);
  const [watchIsClicked, setWatchIsClicked] = useState(false);
  const [clickedWatchId, setClickedWatchId] = useState(null);
  const [displayedCollection, setDisplayedCollection] = useState("");
  const [watchIsHovered, setWatchIsHovered] = useState(false);
  const [selectedWatchId, setSelectedWatchId] = useState(null);

  const screenRef = useRef(null);
  const labelRef = useRef(null);
  const watchesContainerRef = useRef(null);
  const collectionRef = useRef(null);
  const watchRefs = useRef([]);

  const cacheRef = useRef({
    data: null,
    timestamp: null,
    expiryTime: 5 * 60 * 1000 // 5 minutes en millisecondes
  });

  let watchWidth = 100 / medias.length;
  let watchWidthHover = 80 / medias.length;

  useEffect(() => {
    setIsClicked(false);
    setLabel("");
    setLabelColor(bgColor);
    setMobileButtonsVisible(false);
    setIsBooking(false);
  }, []);


  useEffect(() => {
    const fetchWatches = async () => {
      let retries = 3; 

      const attemptFetch = async () => {
        try {
          console.log("URL API utilisée:", `${apiClient.defaults.baseURL}${API_ENDPOINTS.watches}`);
          
          const response = await apiClient.get(API_ENDPOINTS.watches);
          const watchesData = response.data.results;
          
          setWatches(watchesData);

          if (watchesData && watchesData.length > 0) {
            const formattedWatches = watchesData.map(watch => ({
              id: watch.id,
              name: watch.name,
              description: watch.description,
              wide: watch.images.filter(img => img.size === 'wide')
            }));
            
            cacheRef.current.data = formattedWatches;
            cacheRef.current.timestamp = Date.now();
            setMedias(formattedWatches);
            console.log("formattedWatches", formattedWatches);
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des images:', error);
          if (retries > 0) {
            retries--;
            await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre 1 seconde
            return attemptFetch(); // Réessayer
          }
          throw error;
        }
      };

      await attemptFetch();
    };

    fetchWatches();
  }, []);

  useGSAP(() => {
    gsap.from(screenRef.current, {
      duration: 1,
      ease: "power2.out",
      opacity: 0,
    });
  }, []);

  // Initialiser les largeurs des montres
  useEffect(() => {
    if (medias.length > 0 && watchRefs.current) {
      const baseWidth = `${100 / medias.length}%`;
      watchRefs.current.forEach((watchRef) => {
        if (watchRef) {
          gsap.set(watchRef, {
            width: baseWidth
          });
        }
      });
    }
  }, [medias]);

  // Animation for hover effect
  useGSAP(() => {
    if (watchRefs.current) {
      watchRefs.current.forEach((watchRef) => {
        if (watchRef) {
          gsap.to(watchRef, {
            duration: 0.15,
            boxShadow: "0 0 15px rgba(255, 255, 255, 0.3), 0 0 30px rgba(255, 255, 255, 0.2)",
            ease: "power2.inOut"
          });
        }
      });
    }
  }, [watchRefs]);

  function handleWatchHover({width, watchRef, id, isEntering}) {
    if (!watchIsClicked) {
      setWatchIsHovered(isEntering);
      setSelectedWatchId(id);
      
      const timeline = gsap.timeline();

      if (isEntering) {
        // Au hover in, on anime la largeur
        timeline.to(watchRef, {
          duration: 0.1,
          ease: "power2.inOut",
          width: width,
        });
      } else {
        // Au hover out, on anime la largeur ET on scroll
        timeline
          .to(watchRef, {
            duration: 0.1,
            ease: "power2.inOut",
            width: width,
          })
          .to(watchRef.querySelector('.article-image-container'), {
            duration: 0.8,
            ease: "power2.inOut",
            scrollLeft: 0,
          }, "-=0.1");
      }
    }
  }

  function handleWatchClick(watchRef, id) {
    if (!watchIsClicked) {
      setWatchIsClicked(true);
      setClickedWatchId(id);
      gsap.to(watchRef, {
        duration: 0.5,
        ease: "power3.inOut",
        width: "100%",
        height: "100%"
      });
    }
  }

  function handleWatchClose(watchRef, e) {
    e.stopPropagation();
    setClickedWatchId(null);
    setWatchIsClicked(false);
    gsap.to(watchRef, {
      duration: 0.5,
      ease: "power3.inOut",
      width: `${100 / medias.length}%`,
      height: "100%"
    });
  }


  return (
    <>
      <div ref={screenRef} className="fandw-container">
        <div className="fandw-landing">
          <video src="/fandw-img/bg.webm" autoPlay muted loop />
        </div>
        <div className="fandw-gallery-articles" ref={collectionRef}> 
          {loading && 
            <BarLoader className="loader" color="#EFEC8F" height={6} speedMultiplier={1} width={107}/>
          }
          {!loading && 
            medias.map((watch, index) => (
              <Watch 
                key={watch.id}
                watch={watch}
                index={index}
                watchWidth={`${100 / medias.length}%`}
                watchWidthHover={`${(100 / medias.length) * 1.5}%`}
                watchIsClicked={watchIsClicked}
                clickedWatchId={clickedWatchId}
                handleWatchHover={handleWatchHover}
                handleWatchClick={handleWatchClick}
                handleWatchClose={handleWatchClose}
                watchRefs={watchRefs}
              />
            ))
          }
        </div>
        {isBooking && (
          <div className="booking-container">
            <BookingCalendar type="watch" />
          </div>
        )}
        <Button screenRef={screenRef} labelRef={labelRef}/>
      <h1 ref={labelRef} className="title-label" style={{color: labelColor}}>{label}</h1>
      </div>
    </>
  );
}

