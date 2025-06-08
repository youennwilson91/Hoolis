import "./GalleryButtons.scss";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import useStore from "../utils/store";
import {useRef, useState} from "react";
import "../index.css";

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
        }
    }, []);
      
    
    function handleClick(index) {
        setCollectionChosen(buttons[index].label);
        setArticleIsClicked(false);
        setArticleIsHovered(false);
        setSelectedArticleId(null);
    }

    return (
        <div className={"gallery-buttons-open-container"}>
        {buttons.map((button, index) => (
          <button 
            ref={el => {
              if (!buttonRefs.current) {
                buttonRefs.current = [];
              }
              buttonRefs.current[index] = el;
            }}
            className={"gallery-buttons-open"} 
            key={button.id}
            onClick={() => handleClick(index)}
          >
            {button.label}
          </button>
        ))}
        
      </div>
    )
}