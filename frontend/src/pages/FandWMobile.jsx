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
  const mobileCartRef = useRef(null);
  const bookButtonRef = useRef(null);

  const { isBooking, setIsBooking } = useStore();
  const [images, setImages] = useState([]);

  useEffect(() => {
    setIsBooking(false);
  }, []);

  useEffect(() => {
    axios.get('http://localhost:8000/store/watches/')
      .then(response => {
        console.log("Données brutes de l'API:", response.data);
        const data = response.data;
        
        const imageArray = Object.values(data).map(image => ({
          watch1: [image.small['1'], "watch1"],
          watch2: [image.small['2'], "watch2"],
          watch3: [image.small['3'], "watch3"],
          watch4: [image.small['4'], "watch4"]
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

  useGSAP(() => {
    gsap.to(mobileScreenRef.current, {
      backgroundColor: "#D6955B",
      duration: 0.75,
      ease: "power3.inOut",
      opacity: 1
    });
  }, []);

  useGSAP(() => {
    if (bookButtonRef.current) {
      gsap.to(bookButtonRef.current,  {
        duration: 0.25,
        ease: "power2.inOut"
      })
    }
  }, []);

  function handleBooking() {
    setIsBooking(true);
  }

  function closeBooking() {
    setIsBooking(false);
  }


  return (
    <div ref={mobileScreenRef} className="mobile-fandw-container">
      <div className="mobile-fandw-watches">
        {images && images.length > 0 ? (
          images.map((image) => (
            <div key={image.id} className="mobile-fandw-watch">
              <div className="mobile-fandw-watch-image-container">
                <img src={image.watch1[0] || '/path/to/default/image.jpg'} />
                <img src={image.watch2[0] || '/path/to/default/image.jpg'} />
                <img src={image.watch3[0] || '/path/to/default/image.jpg'} />
                <video src={image.watch4[0] || '/path/to/default/image.jpg'} autoPlay loop muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                <div className="mobile-fandw-watch-details">
                  <h1>{image.watch1[1]}</h1>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div>Loading products...</div>
        )}

      </div>
      <Button screenRef={mobileScreenRef} labelRef={labelRef} />
      {!isBooking ? <button 
            ref={bookButtonRef} 
            className="button-book" 
            onClick={handleBooking}
          >
            PRENDRE RENDEZ-VOUS
          </button> : null}

      {isBooking ? <BookingCalendar /> : null}
    </div>

  );
} 