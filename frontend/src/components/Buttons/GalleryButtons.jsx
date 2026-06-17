import "./GalleryButtons.scss";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import useStore from "../../utils/store";
import {useRef, useState} from "react";
import "../../index.css";

export default function GalleryButtons({ screenRef, labelRef, buttonsPosition, type }) {

    const setCollectionChosen = useStore(state => state.setCollectionChosen);
    const setArticleIsHovered = useStore(state => state.setArticleIsHovered);
    const setSelectedArticleId = useStore(state => state.setSelectedArticleId);
    const setArticleIsClicked = useStore(state => state.setArticleIsClicked);
    const buttonRefs = useRef([]);

    const buttons = type === "hoolis" 
        ? [
            
            {id: 1, label: "LE KISS", upscale: 1.7, navigate: "/shop/maroquinerie"},
            //{id: 2,  label: "VETEMENTS", upscale: 1.7, navigate: "/shop/vetements"},
        ]
        : [
            {id: 1,  label: "MAROQUINERIE", upscale: 1.7, navigate: "/resell/sacs"},
            {id: 2,  label: "MONTRES", upscale: 1.7, navigate: "/resell/montres"},
            {id: 3, label: "ACCESSOIRES", upscale: 1.7, navigate: "/resell/accessoires"}
        ];


    useGSAP(() => {
        if (buttonRefs.current) {
            const timeline = gsap.timeline();
            buttonRefs.current.forEach((ref, index) => {
                if (ref) {
                    timeline.to(ref, {
                        opacity: 1,
                        duration: 1,
                        ease: "power3.inOut"
                    }, index * 0.1);
                }
            });
            gsap.to(buttonRefs.current[0], {
                color: "#EFEC8F",
                duration: 0.5,
                ease: "power3.inOut",
            });
        }
    }, []);
      
    
    function handleButtonClick(clickedIndex) {
        setCollectionChosen(buttons[clickedIndex].label);
        setArticleIsClicked(false);
        setArticleIsHovered(false);
        setSelectedArticleId(null);

        gsap.to(
          buttonRefs.current[clickedIndex], {
            color: "#EFEC8F",
            duration: 0.5,
            ease: "power3.inOut",
        });
        
          buttonRefs.current.forEach((buttonRef, index) => {
            if (index !== clickedIndex && buttonRef) {
                gsap.to(buttonRef, {
                    color: "#FFFFFFF",
                    duration: 0.5,
                    ease: "power3.inOut",
                });
            }
        });
    }

    function handleButtonHover(hoveredIndex, isEntering) {
      const targetButton = buttonRefs.current[hoveredIndex];
            
      if (isEntering) {
          gsap.to(targetButton, {
              scale: 1.1,
              duration: 0.3,
              ease: "power3.inOut",
          });
      } else {
          gsap.to(targetButton, {
              scale: 1,
              duration: 0.3,
              ease: "power3.inOut",
          });
      }
  }

    return (
        <div className={"gallery-buttons-open-container"}>
        {buttons.map((button, index) => (
          <button 
            ref={el => {
              buttonRefs.current[index] = el;
            }}
            className={"gallery-buttons-open"} 
            key={button.id}
            onClick={() => handleButtonClick(index)}
            /*onMouseEnter={() => handleButtonHover(index, true)}
            onMouseLeave={() => handleButtonHover(index, false)}*/
          >
            {button.label}
          </button>
        ))}
        
      </div>
    )
}