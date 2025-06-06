import "./GalleryButtons.scss";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useNavigate, useLocation } from "react-router-dom";
import useStore from "../utils/store";
import {useRef, useState} from "react";
import "../index.css";

export default function Button({ screenRef, labelRef, buttonsPosition }) {

    const {setGalleryVisible, isClicked, galleryVisible, setCollectionChosen, setArticleIsHovered, setSelectedArticleId, setArticleIsClicked, displayCollection, collectionChosen} = useStore();
    const buttonRefs = useRef([]);

    const buttons = [
        {id: 1,  label: "VETEMENTS", upscale: 1.7, navigate: "/shop/vetements"},
        {id: 2, label: "MAROQUINERIE", upscale: 1.7, navigate: "/shop/maroquinerie"}
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
      
    
    function handleClick(index) {
      if (!galleryVisible) {
        setGalleryVisible(true);
        setCollectionChosen(buttons[index].label);
      }
      else {
        setCollectionChosen(buttons[index].label);
        setArticleIsClicked(false);
        setArticleIsHovered(false);
        setSelectedArticleId(null);
      }
    }

    return (
        <div className={`${galleryVisible ? "gallery-buttons-open-container" : "gallery-buttons-container"}`}>
        {buttons.map((button, index) => (
          <button 
            ref={el => {
              if (!buttonRefs.current) {
                buttonRefs.current = [];
              }
              buttonRefs.current[index] = el;
            }}
            className={`${galleryVisible ? "gallery-buttons-open" : "gallery-buttons"}`} 
            key={button.id}
            onClick={() => handleClick(index)}
          >
            {button.label}
          </button>
        ))}
        
      </div>
    )
}