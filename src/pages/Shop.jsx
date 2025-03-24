import Button from "../components/NavButtons";
import useStore from "../utils/store";
import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import ShopButtons from "../components/GalleryButtons";
import "./Shop.scss";
import "../components/GalleryButtons.scss";

const dataArticles = [
  {id: 1, title: "ARTICLE 1", description: "Description 1", image: "../public/shop-img/articles/1.jpg"},
  {id: 2, title: "ARTICLE 2", description: "Description 2", image: "../public/shop-img/articles/2.jpg"},
  {id: 3, title: "ARTICLE 3", description: "Description 3", image: "../public/shop-img/articles/3.jpg"},
  {id: 4, title: "ARTICLE 4", description: "Description 4", image: "../public/shop-img/articles/4.jpg"},
  {id: 5, title: "Article 5", description: "Description 5", image: "../public/shop-img/articles/5.jpg"},
  {id: 6, title: "ARTICLE 6", description: "Description 6", image: "../public/shop-img/articles/6.jpg"},
  {id: 7, title: "ARTICLE 7", description: "Description 7", image: "../public/shop-img/articles/7.jpg"},
  {id: 8, title: "ARTICLE 8", description: "Description 8", image: "../public/shop-img/articles/8.jpg"},
  {id: 9, title: "ARTICLE 9", description: "Description 9", image: "../public/shop-img/articles/9.jpg"},
  {id: 10, title: "ARTICLE 10", description: "Description 10", image: "../public/shop-img/articles/10.jpg"}
  
]

export default function Shop() {

  const screenRef = useRef(null);
  const labelRef = useRef(null);
  const galleryRef = useRef(null);
  const articleRef = useRef([]);
  const descriptionRef = useRef(null);

  const [articleIsHovered, setArticleIsHovered] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState(null);
  const { label, setLabel, bgColor, labelColor, setLabelColor, setIsClicked, galleryVisible, setGalleryVisible} = useStore();

  useEffect(() => {
    setIsClicked(false);
    setLabel("");
    setLabelColor(bgColor);
    setGalleryVisible(false); 
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

  function handleArticleHover({width, articleRef, id, isEntering}) {
    setArticleIsHovered(isEntering);
    setSelectedArticleId(id);
    
    const timeline = gsap.timeline();
    timeline
      .to(articleRef, {
        duration: 0.5,
        ease: "power3.inOut",
        width: width,
      })
      .to(`#description-${id}`, {  // Cibler par ID est plus fiable
        duration: 0.5,
        ease: "power3.inOut",
        opacity: isEntering ? 1 : 0,
      }, "-=0.5"); // Commence en même temps que l'animation précédente
  }
  

  return (
    <div ref={screenRef} className="shop-container">
      <div className="shop-landing">
        <img src="../public/shop-img/shop-img-2.jpg" alt="" />
        {galleryVisible && 
          <div ref={galleryRef} className="shop-gallery">
            <ShopButtons/>
            <hr style={{color: "white", width: "100%", position: "relative", bottom: "265px"}}/>
            <div className="shop-gallery-articles"> 
              {dataArticles.map((article, index) => (
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
                >
                  <img src={article.image} alt={article.title} />
                  <div id={`description-${article.id}`}className="article-description" >
                    <h1>{article.title}</h1>
                    <p>{article.description}</p>
                  </div>
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

