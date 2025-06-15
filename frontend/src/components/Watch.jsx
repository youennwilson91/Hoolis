import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import useStore from "../utils/store";

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

  return (
    <div 
      ref={el => {
        if (watchRefs.current) {
          watchRefs.current[index] = el;
        }
      }}
      key={watch.id} 
      className={`watch ${watchIsClicked && clickedWatchId === watch.id ? 'watch-clicked' : ''}`}
      onMouseEnter={() => handleWatchHover({
        width: watchWidthHover, 
        watchRef: watchRefs.current?.[index], 
        id: watch.id, 
        isEntering: true
      })} 
      onMouseLeave={() => handleWatchHover({
        width: watchWidth, 
        watchRef: watchRefs.current?.[index], 
        id: watch.id, 
        isEntering: false
      })} 
      onClick={() => handleWatchClick(watchRefs.current?.[index], watch.id)}
    >
      <div className="article-image-container">
        {watch.wide && watch.wide.map((media, mediaIndex) => (
          media.type === 'image' ? (
            <img 
              key={media.id}
              src={media.media} 
              alt={`${watch.name} - Vue ${mediaIndex + 1} - Montre de luxe Hoolis`} 
              loading="lazy"
            />
          ) : media.type === 'video' ? (
            <video
              key={media.id}
              src={media.media}
              autoPlay
              loop
              muted
              playsInline
            />
          ) : null
        ))}
      </div>
      {!watchIsClicked && 
      <div id={`description-${watch.id}`} className="watch-description" >
        <h1>{watch.name}</h1>
      </div>
      }
      {watchIsClicked && clickedWatchId === watch.id && (
        <div className="watch-details">
          <h1 className="watch-title">{watch.name}</h1>
          {!isBooking ? 
            <button ref={bookButtonRef} className="add-to-cart" onClick={() => setIsBooking(true)}>
              PRENDRE RENDEZ-VOUS
            </button> : null}
          <p>{watch.description}</p>
          <h2 className="close-watch" onClick={(e) => handleWatchClose(watchRefs.current?.[index], e, watch.id)}>
            CLOSE
          </h2>
        </div>
      )}
    </div>
  );
} 