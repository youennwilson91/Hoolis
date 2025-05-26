import "./NavButtons.scss";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useNavigate, useLocation } from "react-router-dom";
import useStore from "../utils/store";
import {useRef, useState, useEffect} from "react";
import "../index.css";

export const buttons = [
  /* {id: 1, landingPosition: {transform: 'translate(245px, 360px)'}, menuPosition: {transform: 'translate(250px, -0vh)'}, label: "ABOUT", bgColor: "#000000", labelColor: "#EFEC8F", upscale: 2, navigate: "/about"}, */
  {id: 2, landingPosition: {transform: 'translate(235px, 310px)'}, menuPosition: {transform: 'translate(125px, -0vh)'}, label: "FRANK &WATCH", bgColor: "#000000", labelColor: "#EFEC8F", upscale: 1.5, navigate: "/fw"},
  {id: 3, landingPosition: {transform: 'translate(50px, 210px)'}, menuPosition: {transform: 'translate(0px, -0vh)'}, label: "HOOLIS", bgColor: "#000000", labelColor: "#EFEC8F", upscale: 2, navigate: "/hoolis"},
  {id: 4, landingPosition: {transform: 'translate(-160px, 300px)'}, menuPosition: {transform: 'translate(-125px, -0vh)'}, label: "GALLERIE", bgColor: "#000000", labelColor: "#EFEC8F", upscale: 1.6, navigate: "/gallery"},
  /* {id: 5, landingPosition: {transform: 'translate(-230px, 380px)'}, menuPosition: {transform: 'translate(-250px, -0vh)'}, label: "SUPPORT", bgColor: "#000000", labelColor: "#EFEC8F", upscale: 1.5, navigate: "/support"}, */
]


export default function Button({ screenRef, labelRef, buttonsPosition }) {

    const {
      setBgColor, 
      setLabel, 
      setLabelColor, 
      setCrownVisible, 
      setButtonsVisible, 
      setIsClicked, 
      isClicked,
      mobileButtonsVisible,
      setMobileButtonsVisible
      
    } = useStore();
    const navigation = useNavigate();
    const location = useLocation();
    const buttonRefs = useRef([]);
    const buttonsMobileRefs = useRef([]);
    
    useEffect(() => {
      location.pathname !== "/" ? setMobileButtonsVisible(false) : setMobileButtonsVisible(true);
    }, []);

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

        if (buttonsMobileRefs.current && mobileButtonsVisible) {
            const mobileTimeline = gsap.timeline();
            buttonsMobileRefs.current.forEach((ref, index) => {
                if (ref) {
                    mobileTimeline.to(ref, {
                        opacity: 1,
                        duration: 1,
                        ease: "power3.inOut"
                    }, index * 0.1);
                }
            });
        }
    }, [mobileButtonsVisible]);

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



    function handleMobileClick({upscale, navigate, ref}) {
      if (location.pathname !== navigate) {
        setIsClicked(true);
        setButtonsVisible(false);
        const timeline = gsap.timeline();
        
        timeline.to(ref, {
          scale: upscale,
          duration: 0.5,
          ease: "power1.inOut",
          color: "white"
        })

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
    <>
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
            style={(() => {
              switch(buttonsPosition) {
                case "landing":
                  return button.landingPosition;
                default:
                  return button.menuPosition;
              }
            })()} 
            key={button.id}
            onMouseEnter={() => location.pathname !== button.navigate ? handleHover({bgColor: button.bgColor, label: button.label, labelColor: button.labelColor, crownVisible: false}) : null}
            onMouseLeave={() => location.pathname !== button.navigate ? handleHover({bgColor: "#000000", label: "", labelColor: "#000000", crownVisible: true}) : null}
            onClick={() => handleClick({upscale: button.upscale, navigate: button.navigate, ref: buttonRefs.current[index]})}
          >
            {button.label}
          </button>
        ))}
      </div>

      <div className="mobile-nav-buttons-container">
        {!mobileButtonsVisible && location.pathname !== "/" && (
        <button 
          className="mobile-button-toggle" 
          onClick={() => setMobileButtonsVisible(!mobileButtonsVisible)}
          style={{backgroundColor: mobileButtonsVisible ? "transparent" : "white"}}
        >
        </button>
        )}

        {mobileButtonsVisible && (
        <div className="mobile-buttons-container">
         <img src="../public/hoolis-img/coquillage-tee-polito.jpg" alt="T-shirt Coquillage" />
          {location.pathname !== "/" && (
            <button 
              className="exit-button"
              onClick={() => setMobileButtonsVisible(false)}
            >
              X
            </button>
          )}
            {buttons.map((button, index) => (
              <button 
                ref={el => {
                  if (!buttonsMobileRefs.current) {
                    buttonsMobileRefs.current = [];
                  }
                  buttonsMobileRefs.current[index] = el;
                }}
                key={button.id}
                className="mobile-button"
                onClick={() => handleMobileClick({upscale: button.upscale, navigate: button.navigate, ref: buttonsMobileRefs.current[index]})}
              >{button.label} 
              </button>
            ))}
          </div>
        )}
      </div>
    </>
    )
}