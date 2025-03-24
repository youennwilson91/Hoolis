import Button from "../components/NavButtons";
import useStore from "../utils/store";
import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import ShopButtons from "../components/GalleryButtons";
import "./Shop.scss";
import "../components/GalleryButtons.scss";

const dataArticles = [
  {id: 1, category: "TOPS", title: "ARTICLE 1", price: "100€", description: "Description 1", image: "../public/shop-img/articles/1.jpg"},
  {id: 2, category: "TOPS", title: "ARTICLE 2", price: "100€", description: "Description 2", image: "../public/shop-img/articles/2.jpg"},
  {id: 3, category: "TOPS", title: "ARTICLE 3", price: "100€", description: "Description 3", image: "../public/shop-img/articles/3.jpg"},
  {id: 4, category: "TOPS", title: "ARTICLE 4", price: "100€", description: "Description 4", image: "../public/shop-img/articles/4.jpg"},
  {id: 5, category: "TOPS", title: "ARTICLE 5", price: "100€", description: "Description 5", image: "../public/shop-img/articles/5.jpg"},
  {id: 6, category: "TOPS", title: "ARTICLE 6", price: "100€", description: "Description 6", image: "../public/shop-img/articles/6.jpg"},
  {id: 7, category: "TOPS", title: "ARTICLE 7", price: "100€", description: "Description 7", image: "../public/shop-img/articles/7.jpg"},
  {id: 8, category: "TOPS", title: "ARTICLE 8", price: "100€", description: "Description 8", image: "../public/shop-img/articles/8.jpg"},
  {id: 9, category: "TOPS", title: "ARTICLE 9", price: "100€", description: "Description 9", image: "../public/shop-img/articles/9.jpg"},
  {id: 10, category: "TOPS", title: "ARTICLE 10", price: "100€", description: "Description 10", image: "../public/shop-img/articles/10.jpg"},
  {id: 11, category: "ACCESSORIES", title: "ARTICLE 11", price: "100€", description: "Description 11", image: "../public/shop-img/articles/acc-1.jpg"},
  {id: 12, category: "ACCESSORIES", title: "ARTICLE 12", price: "100€", description: "Description 12", image: "../public/shop-img/articles/acc-2.jpg"},
  {id: 13, category: "ACCESSORIES", title: "ARTICLE 13", price: "100€", description: "Description 13", image: "../public/shop-img/articles/acc-3.jpg"},
  {id: 14, category: "ACCESSORIES", title: "ARTICLE 14", price: "100€", description: "Description 14", image: "../public/shop-img/articles/acc-4.jpg"},
  {id: 15, category: "BOTTOMS", title: "ARTICLE 15", price: "100€", description: "Description 15", image: "../public/shop-img/articles/pants-1.jpg"},
  {id: 16, category: "BOTTOMS", title: "ARTICLE 16", price: "100€", description: "Description 16", image: "../public/shop-img/articles/pants-2.jpg"},
  {id: 17, category: "BOTTOMS", title: "ARTICLE 17", price: "100€", description: "Description 17", image: "../public/shop-img/articles/pants-3.jpg"},
  {id: 18, category: "BOTTOMS", title: "ARTICLE 18", price: "100€", description: "Description 18", image: "../public/shop-img/articles/pants-4.jpg"}  
  
]

export default function Shop() {

  const screenRef = useRef(null);
  const labelRef = useRef(null);
  const galleryRef = useRef(null);
  const articleRef = useRef([]);
  const articleGalleryRef = useRef(null);
  const descriptionRef = useRef(null);

  const [articleIsHovered, setArticleIsHovered] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState(null);
  const { label, setLabel, bgColor, labelColor, setLabelColor, setIsClicked, galleryVisible, setGalleryVisible, articleGalleryChosen} = useStore();
  const [isArticleClicked, setIsArticleClicked] = useState(false);
  const [clickedArticleId, setClickedArticleId] = useState(null);


  useEffect(() => {
    setIsClicked(false);
    setLabel("");
    setLabelColor(bgColor);
    setGalleryVisible(false); 
    setArticleIsHovered(false);
    setSelectedArticleId(null);

  }, []);

  useGSAP(() => {
    gsap.to(screenRef.current, {
      duration: 0.75,
      ease: "power3.inOut",
      opacity: 1
    });
  }, []);

  useEffect(() => {
    if (galleryVisible && galleryRef.current) {
      galleryRef.current.style.opacity = "0";
      gsap.to(galleryRef.current, {
        duration: 0.75,
        ease: "power3.inOut",
        opacity: 1
      });
    }
  }, [galleryVisible]);

  function handleGalleryOpen() {
    setGalleryVisible(true);
  }

  useGSAP(() => {
    console.log(articleGalleryChosen);
      gsap.to(articleGalleryRef.current, {
        duration: 0.75,
        ease: "power3.inOut",
        opacity: 1
      }, 0.5);
    }, [articleGalleryChosen]);

  function handleArticleHover({width, articleRef, id, isEntering}) {
    if (!isArticleClicked) {
      setArticleIsHovered(isEntering);
      setSelectedArticleId(id);
      
    const timeline = gsap.timeline();

    timeline
      .to(articleRef, {
        duration: 0.5,
        ease: "power3.inOut",
        width: width,
      })
      .to(`#description-${id}`, {  
        duration: 0.5,
        ease: "power3.inOut",
        opacity: isEntering ? 1 : 0,
      }, "-=0.5"); 
    }
  }

  function handleArticleClick(articleRef, id) {
    console.log("Article cliqué, id:", id);
    if (!isArticleClicked) {
      setIsArticleClicked(true);
      setClickedArticleId(id);
      gsap.to(articleRef, {
        duration: 0.5,
        ease: "power3.inOut",
        width: "100%",
        height: "100%"
      });
    }
  }

  function handleArticleClose(articleRef, e) {
    e.stopPropagation();
    setClickedArticleId(null);
    setIsArticleClicked(false);
    gsap.to(articleRef, {
      duration: 0.5,
      ease: "power3.inOut",
      width: "7%",
      height: "100%"
    });
  }



  return (
    <div ref={screenRef} className="shop-container">
      <div className="shop-landing">
        <img src="../public/shop-img/shop-img-2.jpg" alt="" />
        {galleryVisible && 
          <div ref={galleryRef} className="shop-gallery">
            <ShopButtons/>
            <hr style={{color: "white", width: "100%", position: "relative", bottom: "265px"}}/>
            <div className="shop-gallery-articles" ref={articleGalleryRef}> 
              {dataArticles.filter(article => article.category === articleGalleryChosen).map((article, index) => (
                <div 
                  ref={el => articleRef.current[index] = el} 
                  key={article.id} 
                  className="article" 
                  onMouseEnter={() => handleArticleHover({
                    width: "20%", 
                    articleRef: articleRef.current[index], 
                    id: article.id, 
                    isEntering: true
                  })} 
                  onMouseLeave={() => handleArticleHover({
                    width: "7%", 
                    articleRef: articleRef.current[index], 
                    id: article.id, 
                    isEntering: false
                  })} 
                  onClick={() => handleArticleClick(articleRef.current[index], article.id)}
                >
                  <img src={article.image} alt={article.title} />
                  {!isArticleClicked && 
                  <div id={`description-${article.id}`} className="article-description" >
                    <h1>{article.title}</h1>
                  </div>
                  }
                  {isArticleClicked && clickedArticleId === article.id && (
                    <div className="article-details">
                      <h1 className="article-title">{article.title}</h1>
                      <h1 className="article-price">{article.price}</h1>
                      <p>{article.description} <br />{article.description} <br />{article.description}</p>
                      <h2 className="close-article" onClick={(e) => handleArticleClose(articleRef.current[index], e, article.id)}>
                        X
                      </h2>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          }
        {!galleryVisible && <ShopButtons onClick={handleGalleryOpen}/>}
        <Button screenRef={screenRef} labelRef={labelRef}/>
      </div>
      <h1 ref={labelRef} className="title-label" style={{color: labelColor}}>{label}</h1>
    </div>
  );
}

