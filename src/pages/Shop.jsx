import Button from "../components/NavButtons";
import useStore from "../utils/store";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import ShopButtons from "../components/GalleryButtons";
import "./Shop.scss";
import "../components/GalleryButtons.scss";

const dataArticles = [
  {id: 1, title: "Article 1", description: "Description 1"},
  {id: 2, title: "Article 2", description: "Description 2"},
  {id: 3, title: "Article 3", description: "Description 3"},
  {id: 4, title: "Article 4", description: "Description 4"},
  {id: 5, title: "Article 5", description: "Description 5"},
  {id: 6, title: "Article 6", description: "Description 6"},
  {id: 7, title: "Article 7", description: "Description 7"},
  {id: 8, title: "Article 8", description: "Description 8"},
  {id: 9, title: "Article 9", description: "Description 9"},
  {id: 10, title: "Article 10", description: "Description 10"},
  {id: 11, title: "Article 11", description: "Description 11"},
  {id: 12, title: "Article 12", description: "Description 12"}
  
]

export default function Shop() {

  const screenRef = useRef(null);
  const labelRef = useRef(null);
  const galleryRef = useRef(null);
  const closeButtonRef = useRef(null);
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

  function handleClick() {
    setGalleryVisible(true);
    const timeline = gsap.timeline();
    timeline.to(galleryRef.current, {
      duration: 0.75,
      ease: "power3.inOut",
      opacity: 1,
    })
    .to(closeButtonRef.current, {
      duration: 0.75,
      ease: "power3.inOut",
      opacity: 1,
      color: "white"
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
            <div className="shop-gallery-articles"> 

            </div>
          </div>
          }
        {!galleryVisible && <ShopButtons onClick={handleClick}/>}
        <Button screenRef={screenRef} labelRef={labelRef}/>
      </div>
      <h1 ref={labelRef} className="title-label" style={{color: labelColor}}>{label}</h1>
    </div>
  );
}

