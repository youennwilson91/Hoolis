import "./GalleryButtons.scss";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import useStore from "../../utils/store";
import {useRef, useState} from "react";
import "../../index.css";

export default function Button({ screenRef, labelRef, buttonsPosition }) {

    const {isClicked, setCollectionChosen, setArticleIsHovered, setSelectedArticleId, setArticleIsClicked, displayCollection, collectionChosen} = useStore();
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
            onMouseEnter={() => handleButtonHover(index, true)}
            onMouseLeave={() => handleButtonHover(index, false)}
          >
            {button.label}
          </button>
        ))}
        
      </div>
    )
}