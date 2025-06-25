import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import useStore from "../utils/store";
import { sanitizeImageUrl, sanitizeAltText, sanitizeText } from "../utils/sanitizer";

export default function Watch({ 
  watch, 
  index, 
  watchWidth,
  watchWidthHover,
  watchIsClicked, 
  clickedWatchId, 
  handleWatchHover, 
  handleWatchClick, 
  handleWatchClose, 
  watchRefs
}) {
  const { isBooking, setIsBooking } = useStore();
  const bookButtonRef = useRef(null);

  // Sanitiser les données de la montre
  const sanitizedWatch = {
    id: watch.id,
    name: sanitizeText(watch.name || ''),
    description: sanitizeText(watch.description || ''),
    wide: watch.wide || []
  };

  return (
    <div 
      ref={el => {
        if (watchRefs.current) {
          watchRefs.current[index] = el;
        }
      }}
      key={sanitizedWatch.id} 
      className={`watch ${watchIsClicked && clickedWatchId === sanitizedWatch.id ? 'watch-clicked' : ''}`}
      onMouseEnter={() => handleWatchHover({
        width: watchWidthHover, 
        watchRef: watchRefs.current?.[index], 
        id: sanitizedWatch.id, 
        isEntering: true
      })} 
      onMouseLeave={() => handleWatchHover({
        width: watchWidth, 
        watchRef: watchRefs.current?.[index], 
        id: sanitizedWatch.id, 
        isEntering: false
      })} 
      onClick={() => handleWatchClick(watchRefs.current?.[index], sanitizedWatch.id)}
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
      {!watchIsClicked && 
      <div id={`description-${sanitizedWatch.id}`} className="watch-description" >
        <h1>{sanitizedWatch.name}</h1>
      </div>
      }
      {watchIsClicked && clickedWatchId === sanitizedWatch.id && (
        <div className="watch-details">
          <h1 className="watch-title">{sanitizedWatch.name}</h1>
          {!isBooking ? 
            <button ref={bookButtonRef} className="add-to-cart" onClick={() => setIsBooking(true)}>
              PRENDRE RENDEZ-VOUS
            </button> : null}
          <p>{sanitizedWatch.description}</p>
          <h2 className="close-watch" onClick={(e) => handleWatchClose(watchRefs.current?.[index], e, sanitizedWatch.id)}>
            CLOSE
          </h2>
        </div>
      )}
    </div>
  );
} 