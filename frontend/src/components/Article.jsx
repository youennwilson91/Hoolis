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
      onClick={() => handleArticleClick(articleRefs.current[index], article.id)}
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
              <h1 className="add-to-cart" onClick={(e) => handleAddToCart(article, e)}>AJOUTER AU PANIER</h1>
              {/* BOOKING DISABLED */}
              {/* {!isBooking && !resell ?
                <button ref={bookButtonRef} className="add-to-cart" onClick={(e) => {
                  e.stopPropagation();
                  setIsBooking(true);
                }}>
                  PRENDRE RENDEZ-VOUS
                </button> : null} */}
              {/*<button className="add-to-cart" onClick={(e) => {
                e.stopPropagation();
                setShowDescription(true);
              }}>
                DESCRIPTION
              </button>*/}
            </div>
          )}
        

          {/* Popup de description */}
          {showDescription && (
            <div className="description-popup-overlay" onClick={() => setShowDescription(false)}>
              <div className="description-popup" onClick={(e) => e.stopPropagation()}>
                <p>{article.description}</p>
                <button className="close-popup-btn" onClick={() => setShowDescription(false)}>
                  Fermer
                </button>
              </div>
            </div>
          )}


          <h2 className="close-article" onClick={(e) => handleArticleClose(articleRefs.current[index], e, article.id)}>
            FERMER
          </h2>
        </div>
      )}
      
    </div>
  );
}

export default memo(ArticleComponent);