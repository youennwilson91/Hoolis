import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import useStore from "../utils/store";

export default function Article({ 
  article, 
  index, 
  articleIsClicked, 
  clickedArticleId, 
  handleArticleHover, 
  handleArticleClick, 
  handleArticleClose, 
  handleAddToCart,
  articleRefs
}) {

  const { isBooking, setIsBooking } = useStore();
  const bookButtonRef = useRef(null);

  return (
    <div 
      ref={el => articleRefs.current[index] = el} 
      key={article.id} 
      className="article" 
      onMouseEnter={() => handleArticleHover({
        width: "20%", 
        articleRef: articleRefs.current[index], 
        id: article.id, 
        isEntering: true
      })} 
      onMouseLeave={() => handleArticleHover({
        width: "7%", 
        articleRef: articleRefs.current[index], 
        id: article.id, 
        isEntering: false
      })} 
      onClick={() => handleArticleClick(articleRefs.current[index], article.id)}
    >
      <div className="article-image-container">
        {/* Accéder correctement aux images de l'article */}
        {article.images && article.images.length > 0 && (
          <img 
            src={article.images[0].image} 
            alt={`${article.title} - Vue principale - Montre de luxe Hoolis`} 
            loading="lazy"
          />
        )}
        {article.images && article.images.length > 1 && (
          <img 
            src={article.images[1].image} 
            alt={`${article.title} - Vue détaillée - Montre de luxe Hoolis`} 
            loading="lazy"
          />
        )}
      </div>
      {!articleIsClicked && 
      <div id={`description-${article.id}`} className="article-description" >
        <h1>{article.title}</h1>
      </div>
      }
      {articleIsClicked && clickedArticleId === article.id && (
        <div className="article-details">
          <h1 className="article-title">{article.title}</h1>
          <h1 className="article-price">{article.price}€</h1>
          {/*<h1 className="add-to-cart" onClick={() => handleAddToCart(article)}>SHOP</h1>*/}

          {!isBooking ? 
            <button ref={bookButtonRef} className="add-to-cart" onClick={() => setIsBooking(true)}>
              PRENDRE RENDEZ-VOUS
            </button> : null}
          <p>{article.description}</p>
          <h2 className="close-article" onClick={(e) => handleArticleClose(articleRefs.current[index], e, article.id)}>
            CLOSE
          </h2>
        </div>
      )}
      
    </div>
  );
} 