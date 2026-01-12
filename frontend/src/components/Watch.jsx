import { useRef, useEffect, useState, memo } from "react";
import { gsap } from "gsap";
import useStore from "../utils/store";
import { sanitizeImageUrl, sanitizeAltText, sanitizeText } from "../utils/sanitizer";
import OrderForm from "./OrderForm";

export function Watch({ 
  watch, 
  index, 
  watchWidth,
  watchWidthHover,
  clickedWatchId, 
  isClicked,
  handleWatchHover, 
  handleWatchClick, 
  handleWatchClose, 
  watchRefs,
  is_available
}) {

  console.log(watch);

  const setIsBooking = useStore(state => state.setIsBooking);
  const bookButtonRef = useRef(null);
  const [showDescription, setShowDescription] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);

  // Sanitiser les données de la montre
  const sanitizedWatch = {
    id: watch.id,
    name: sanitizeText(watch.name || ''),
    description: sanitizeText(watch.description || ''),
    price: watch.price || 0,
    wide: watch.wide || [],
    is_available: watch.is_available || true
  };

  return (
    <div 
      ref={el => {
        if (watchRefs.current) {
          watchRefs.current[index] = el;
        }
      }}
      key={sanitizedWatch.id} 
      className={`watch ${clickedWatchId === sanitizedWatch.id ? 'watch-clicked' : ''} ${!is_available ? 'watch-unavailable' : ''}`}
      onMouseEnter={() => !isClicked && handleWatchHover({
        width: watchWidthHover, 
        watchRef: watchRefs.current?.[index], 
        id: sanitizedWatch.id, 
      })} 
      onMouseLeave={() => !isClicked && handleWatchHover({
        width: watchWidth, 
        watchRef: watchRefs.current?.[index], 
        id: sanitizedWatch.id, 
      })} 
      onClick={() => !isClicked && handleWatchClick(watchRefs.current?.[index], sanitizedWatch.id)}
    >
      <div className="article-image-container">
        {sanitizedWatch.wide && sanitizedWatch.wide.map((media, mediaIndex) => (
          media.type === 'image' ? (
            <img 
              key={media.id}
              src={sanitizeImageUrl(media.media)} 
              alt={sanitizeAltText(`${sanitizedWatch.name} - Vue ${mediaIndex + 1} - Montre de luxe Hoolis`)} 
              loading="lazy"
            />
          ) : media.type === 'video' ? (
            <video
              key={media.id}
              src={sanitizeImageUrl(media.media)}
              autoPlay
              loop
              muted
              playsInline
            />
          ) : null
        ))}
      </div>
      {!clickedWatchId && 
      <div id={`description-${sanitizedWatch.id}`} className="watch-description" >
        <h1>{sanitizedWatch.name}</h1>
      </div>
      }
      {clickedWatchId === sanitizedWatch.id && (
        <div className="watch-details">
          <h1 className="watch-title">{sanitizedWatch.name}</h1>
          <h1 className="article-price">{sanitizedWatch.price}€</h1>
           <div className="article-buttons-container">
            {is_available ? <button className="add-to-cart" onClick={(e) => {
              e.stopPropagation();
              setShowOrderForm(true);
            }}>
              COMMANDER
            </button> : <button className="add-to-cart" disabled style={{cursor: 'not-allowed'}}>
              INDISPONIBLE
            </button>}
            {is_available && <button ref={bookButtonRef} className="add-to-cart" onClick={(e) => {
                e.stopPropagation();
                setIsBooking(true);
              }}>
                PRENDRE RENDEZ-VOUS
            </button>}
            <button className="add-to-cart" onClick={(e) => {
              e.stopPropagation();
              setShowDescription(true);
            }}>
              DESCRIPTION
            </button>
          </div>

          {/* Popup de description */}
          {showDescription && (
            <div className="description-popup-overlay" onClick={() => setShowDescription(false)}>
              <div className="description-popup" onClick={(e) => e.stopPropagation()}>
                <h3>Description</h3>
                <p>{sanitizedWatch.description}</p>
                <button className="close-popup-btn" onClick={() => setShowDescription(false)}>
                  FERMER
                </button>
              </div>
            </div>
          )}

          <h2 className="close-watch" onClick={(e) => handleWatchClose(watchRefs.current?.[index], e, sanitizedWatch.id)}>
            FERMER
          </h2>
        </div>
      )}

      {/* Composant OrderForm séparé */}
      <OrderForm 
        item={sanitizedWatch}
        isOpen={showOrderForm}
        onClose={() => setShowOrderForm(false)}
      />
    </div>
  );
} 

export default memo(Watch);