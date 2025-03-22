import "../CSS/Buttons.css";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useNavigate, useLocation } from "react-router-dom";
import useStore from "../utils/store";
import {useRef, useState} from "react";
import "../index.css";

export default function Button({ screenRef, labelRef, buttonsPosition }) {

    const {setBgColor, setLabel, setLabelColor, setCrownVisible, setButtonsVisible} = useStore();
    const navigation = useNavigate();
    const location = useLocation();
    const buttonRefs = useRef([]);

    const buttons = [
        {id: 1, landingPosition: {transform: 'translate(250px, -50px)'}, menuPosition: {transform: 'translate(250px, 340px)'}, label: "F&W", bgColor: "#226D68", labelColor: "#21514e", upscale: 1.7, navigate: "/fw"},
        {id: 2, landingPosition: {transform: 'translate(230px, -130px)'}, menuPosition: {transform: 'translate(125px, 340px)'}, label: "SHOP", bgColor: "#ddb94b", labelColor: "#f5d77e", upscale: 1.7, navigate: "/shop"},
        {id: 3, landingPosition: {transform: 'translate(50px, -210px)'}, menuPosition: {transform: 'translate(0px, 340px)'}, label: "HOOLIS", bgColor: "#D6955B", labelColor: "#b5773f", upscale: 1.5, navigate: "/hoolis"},
        {id: 4, landingPosition: {transform: 'translate(-160px, -130px)'}, menuPosition: {transform: 'translate(-125px, 340px)'}, label: "ABOUT", bgColor: "#ddb94b", labelColor: "#f5d77e", upscale: 1.5, navigate: "/about"},
        {id: 5, landingPosition: {transform: 'translate(-230px, -40px)'}, menuPosition: {transform: 'translate(-250px, 340px)'}, label: "CONTACT", bgColor: "#226D68", labelColor: "#21514e", upscale: 1.3, navigate: "/contact"},
    ]

    const [isClicked, setIsClicked] = useState(false);

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
        setBgColor(bgColor);
        setLabel(label);
        setLabelColor(labelColor);
        setCrownVisible(crownVisible);
      }
    }
    
    function handleClick({upscale, navigate}) {
      if (location.pathname !== navigate) {
      setIsClicked(true);
      setButtonsVisible(false);
      const timeline = gsap.timeline();

      if (labelRef && labelRef.current) {
        timeline.to(labelRef.current, {
          scale: upscale,
          duration: 0.5,
          ease: "power1.inOut",
          color: "white"
        })
      }
      
      if (screenRef && screenRef.current) {
        timeline.to(screenRef.current, {
          opacity: 0,
          duration: 0.5,
          ease: "power3.inOut",
          delay: 0.5
        })
      }
      
      setTimeout(() => {
          navigation(navigate);
        }, 1500);
      }
    }

    return (
        <div className="buttons-container">
        {buttons.map((button, index) => (
          <button 
            ref={el => {
              if (!buttonRefs.current) {
                buttonRefs.current = [];
              }
              buttonRefs.current[index] = el;
            }}
            className={`pulse-button ${location.pathname === button.navigate ? "button-show" : ""}`} 
            style={buttonsPosition === "landing" ? button.landingPosition : button.menuPosition} 
            key={button.id}
            onMouseEnter={() => handleHover({bgColor: button.bgColor, label: button.label, labelColor: button.labelColor, crownVisible: false})}
            onMouseLeave={() => handleHover({bgColor: "#000000", label: "", labelColor: "#000000", crownVisible: true})}
            onClick={() => handleClick({upscale: button.upscale, navigate: button.navigate})}
          >
            {button.label}
          </button>
        ))}
      </div>
    )
}