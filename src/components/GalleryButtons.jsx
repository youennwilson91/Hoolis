import "./GalleryButtons.scss";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useNavigate, useLocation } from "react-router-dom";
import useStore from "../utils/store";
import {useRef, useState} from "react";
import "../index.css";

export default function Button({ screenRef, labelRef, buttonsPosition }) {

    const {setGalleryVisible, setButtonsVisible, setIsClicked, isClicked, galleryVisible, setArticleGalleryChosen, setArticleIsHovered, setSelectedArticleId, setArticleIsClicked} = useStore();
    const location = useLocation();
    const buttonRefs = useRef([]);

    const buttons = [
        {id: 1, initialPosition: {transform: 'translate(200px, -200px)'}, galleryPosition: {transform: 'translate(-300px, -270px)'}, label: "TOPS", upscale: 1.7, navigate: "/shop/tops"},
        {id: 2, initialPosition: {transform: 'translate(300px, 190px)'}, galleryPosition: {transform: 'translate(-100px, -270px)'}, label: "BOTTOMS", upscale: 1.7, navigate: "/shop/bottoms"},
        {id: 3, initialPosition: {transform: 'translate(-50px, 230px)'}, galleryPosition: {transform: 'translate(100px, -270px)'}, label: "SHOES", upscale: 1.5, navigate: "/shop/shoes"},
        {id: 4, initialPosition: {transform: 'translate(-160px, 0px)'}, galleryPosition: {transform: 'translate(300px, -270px)'}, label: "ACCESSORIES", upscale: 1.5, navigate: "/shop/accessories"}
    ]


    useGSAP(() => {
        if (buttonRefs.current) {
            const timeline = gsap.timeline();
            buttonRefs.current.forEach((ref, index) => {
                if (ref) {
                    timeline.to(ref, {
                        opacity: 1,
                        duration: 1.5,
                        ease: "power3.inOut"
                    }, index * 0.1);
                }
            });
        }
    }, []);
      
    function handleHover({ bgColor, label, labelColor, crownVisible }) {
      if (!isClicked) {
      }
    }
    
    function handleClick(index) {
      
      if (!galleryVisible) {
        setGalleryVisible(true);
        setArticleGalleryChosen(buttons[index].label);

      }
      else {
        setArticleGalleryChosen(buttons[index].label);
        setArticleIsClicked(false);
        setArticleIsHovered(false);
        setSelectedArticleId(null);
      }
    }

    return (
        <div className="gallery-buttons-container">
        {buttons.map((button, index) => (
          <button 
            ref={el => {
              if (!buttonRefs.current) {
                buttonRefs.current = [];
              }
              buttonRefs.current[index] = el;
            }}
            className={`gallery-buttons`} 
            style={galleryVisible ? button.galleryPosition : button.initialPosition}
            key={button.id}
            onMouseEnter={() => handleHover({bgColor: button.bgColor, label: button.label, labelColor: button.labelColor, crownVisible: false})}
            onMouseLeave={() => handleHover({bgColor: "#000000", label: "", labelColor: "#000000", crownVisible: true})}
            onClick={() => handleClick(index)}
          >
            {button.label}
          </button>
        ))}
      </div>
    )
}