import { useState, memo } from "react";
import "./Article.scss";

function ArticleComponent({
  article,
  index,
  isClicked,
  isAnyArticleClicked,
  handleArticleHover,
  handleArticleClick,
  handleArticleClose,
  handleAddToCart,
  articleRefs,
  resell,
  isMobile
}) {


  //console.log('🔵 Article render', article.id)
  // BOOKING DISABLED
  // const isBooking = useStore(state => state.isBooking);
  // const setIsBooking = useStore(state => state.setIsBooking);
  // const bookButtonRef = useRef(null);
  const [showDescription, setShowDescription] = useState(false);

  return (
    <div
      ref={el => articleRefs.current[index] = el}
      key={article.id}
      className={`article ${isClicked && isMobile ? 'article-clicked' : ''}`}
      onMouseEnter={() => {
        if (!isAnyArticleClicked && handleArticleHover) {
          handleArticleHover({
            width: "20%",
            articleRef: articleRefs.current[index],
            id: article.id
          });
        }
      }}
      onMouseLeave={() => {
        if (!isAnyArticleClicked && handleArticleHover) {
          handleArticleHover({
            width: "7%",
            articleRef: articleRefs.current[index],
            id: article.id
          });
        }
      }}
      onClick={(e) => {
        if (isClicked) {
          handleArticleClose(articleRefs.current[index], e, article.id);
        } else {
          handleArticleClick(articleRefs.current[index], article.id);
        }
      }}
    >
      <div className="article-image-container">
        {/* Accéder correctement aux images de l'article */}
        {article.images && article.images.length > 0 && (
          <img
            src={article.images[0].image}
            alt={`${article.title} - Vue principale - Montre de luxe Hoolis`}
          />
        )}
        {article.images && article.images.length > 1 && (
          <img
            src={article.images[1].image}
            alt={`${article.title} - Vue détaillée - Montre de luxe Hoolis`}
          />
        )}
      </div>
      {isClicked  && (
        <div className="article-details">
          <h1 className="article-title">{article.title}</h1>
          <h1 className="article-price">{article.price}€</h1>

          {/* Boutons pour mobile avec icônes */}
          {isMobile ? (
            <div className="mobile-article-action-buttons">
              <button
                className="action-button cart-button"
                onClick={(e) => handleAddToCart(article, e)}
                aria-label="Ajouter au panier"
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width: '50px', height: '50px'}}>
                  <circle cx="12" cy="12" r="10" stroke="#FFFFFF" strokeWidth="1.8"/>
                  <path d="M15 12L12 12M12 12L9 12M12 12L12 9M12 12L12 15" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>

              {/* BOOKING DISABLED */}
              {/* {!isBooking && !resell && (
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
              )} */}

              <button
                className="action-button info-button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDescription(true);
                }}
                aria-label="Voir la description"
              >
                <svg viewBox="0 0 416.979 416.979" className="action-icon">
                  <path d="M356.004,61.156c-81.37-81.47-213.377-81.551-294.848-0.182c-81.47,81.371-81.552,213.379-0.181,294.85
                    c81.369,81.47,213.378,81.551,294.849,0.181C437.293,274.636,437.375,142.626,356.004,61.156z M237.6,340.786
                    c0,3.217-2.607,5.822-5.822,5.822h-46.576c-3.215,0-5.822-2.605-5.822-5.822V167.885c0-3.217,2.607-5.822,5.822-5.822h46.576
                    c3.215,0,5.822,2.604,5.822,5.822V340.786z M208.49,137.901c-18.618,0-33.766-15.146-33.766-33.765
                    c0-18.617,15.147-33.766,33.766-33.766c18.619,0,33.766,15.148,33.766,33.766C242.256,122.755,227.107,137.901,208.49,137.901z"/>
                </svg>
              </button>
            </div>
          ) : (
            /* Boutons pour desktop */
            <div className="article-buttons-container">
              <button className="add-to-cart" onClick={(e) => { e.stopPropagation(); handleAddToCart(article, e); }}>
                <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                  <g transform="translate(-12,-244)">
                    <path d="m 37,250.00586 c -2.960901,0 -5.434401,2.17093 -5.914062,5 H 16.628906 c -1.625268,0 -2.862846,1.51426 -2.58789,3.10156 l 2.27539,13.13672 c 0.278528,1.60786 1.699779,2.76172 3.3125,2.76172 h 16.767578 c 1.61436,0 3.012976,-1.16097 3.310547,-2.74805 a 1.0001,1.0001 0 0 0 0.002,-0.0137 l 1.998,-11.52731 C 42.515917,258.69406 43,257.40433 43,256.00586 c 0,-3.30186 -2.698143,-6 -6,-6 z m 0,2 c 2.220979,0 4,1.77902 4,4 0,2.22098 -1.779021,4 -4,4 -2.220979,0 -4,-1.77902 -4,-4 0,-2.22098 1.779021,-4 4,-4 z m -20.371094,5 h 14.457032 c 0.479661,2.82907 2.953161,5 5.914062,5 0.839976,0 1.639835,-0.17549 2.367188,-0.49024 l -1.625,9.375 c -0.122524,0.65348 -0.680468,1.11524 -1.345704,1.11524 H 19.628906 c -0.666872,0 -1.233178,-0.46327 -1.34375,-1.10156 l -2.27539,-13.13672 c -0.07374,-0.42572 0.201415,-0.76172 0.61914,-0.76172 z"/>
                    <path d="m 23.304687,246.07227 a 1,1 0 0 0 -0.55664,0.52734 l -4,9 a 1,1 0 0 0 0.507812,1.32031 1,1 0 0 0 1.320313,-0.50781 l 4,-9 a 1,1 0 0 0 -0.507813,-1.32031 1,1 0 0 0 -0.763672,-0.0195 z"/>
                    <path d="m 32.466797,246.01172 c -0.174002,-0.0184 -0.349776,0.009 -0.509766,0.0801 -0.50494,0.22425 -0.73234,0.81549 -0.507812,1.32031 l 1.759765,3.95898 c 0.516981,-0.42442 1.103473,-0.76593 1.742188,-1 l -1.675781,-3.77148 c -0.107652,-0.24238 -0.307179,-0.43207 -0.554688,-0.52734 -0.08163,-0.0312 -0.166989,-0.0515 -0.253906,-0.0606 z"/>
                    <path d="m 28,259.00586 a 1,1 0 0 0 -1,1 v 8 a 1,1 0 0 0 1,1 1,1 0 0 0 1,-1 v -8 a 1,1 0 0 0 -1,-1 z"/>
                    <path d="m 24,259.00586 a 1,1 0 0 0 -1,1 v 8 a 1,1 0 0 0 1,1 1,1 0 0 0 1,-1 v -8 a 1,1 0 0 0 -1,-1 z"/>
                    <path d="m 32,262.00586 a 1,1 0 0 0 -1,1 v 5 a 1,1 0 0 0 1,1 1,1 0 0 0 1,-1 v -5 a 1,1 0 0 0 -1,-1 z"/>
                    <path d="m 37,253.00586 a 1,1 0 0 0 -1,1 v 1 h -1 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 1 v 1 a 1,1 0 0 0 1,1 1,1 0 0 0 1,-1 v -1 h 1 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 h -1 v -1 a 1,1 0 0 0 -1,-1 z"/>
                  </g>
                </svg>
              </button>
              {/* BOOKING DISABLED */}
              {/* {!isBooking && !resell ?
                <button ref={bookButtonRef} className="add-to-cart" onClick={(e) => {
                  e.stopPropagation();
                  setIsBooking(true);
                }}>
                  PRENDRE RENDEZ-VOUS
                </button> : null} */}
              <button
                className="add-to-cart info-button-desktop"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDescription(true);
                }}
                aria-label="Voir la description"
              >
                <svg viewBox="0 0 416.979 416.979" xmlns="http://www.w3.org/2000/svg">
                  <path d="M356.004,61.156c-81.37-81.47-213.377-81.551-294.848-0.182c-81.47,81.371-81.552,213.379-0.181,294.85
                    c81.369,81.47,213.378,81.551,294.849,0.181C437.293,274.636,437.375,142.626,356.004,61.156z M237.6,340.786
                    c0,3.217-2.607,5.822-5.822,5.822h-46.576c-3.215,0-5.822-2.605-5.822-5.822V167.885c0-3.217,2.607-5.822,5.822-5.822h46.576
                    c3.215,0,5.822,2.604,5.822,5.822V340.786z M208.49,137.901c-18.618,0-33.766-15.146-33.766-33.765
                    c0-18.617,15.147-33.766,33.766-33.766c18.619,0,33.766,15.148,33.766,33.766C242.256,122.755,227.107,137.901,208.49,137.901z"/>
                </svg>
              </button>
            </div>
          )}
        

          {/* Popup de description */}
          {showDescription && (
            <div className="description-popup-overlay" onClick={() => setShowDescription(false)}>
              <div className="description-popup" onClick={(e) => e.stopPropagation()}>
                <p>{article.description}</p>
                <button className="close-popup-btn" onClick={() => setShowDescription(false)}>
                  ✕
                </button>
              </div>
            </div>
          )}


          <h2 className="close-article" onClick={(e) => handleArticleClose(articleRefs.current[index], e, article.id)}>
            ✕
          </h2>
        </div>
      )}
      
    </div>
  );
}

export default memo(ArticleComponent);