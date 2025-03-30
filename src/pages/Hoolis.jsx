import Button from "../components/NavButtons";
import useStore from "../utils/store";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import "./Hoolis.scss";
import "../index.css";

export default function Hoolis() {
  const screenRef = useRef(null);
  const mobileScreenRef = useRef(null);
  const labelRef = useRef(null);
  const { label, setLabel, bgColor, labelColor, setLabelColor, setIsClicked, mobileButtonsVisible, setMobileButtonsVisible} = useStore();

  useEffect(() => {
    setIsClicked(false);
    setLabel("");
    setLabelColor("bgColor");
    setMobileButtonsVisible(false);
  }, []);

  useGSAP(() => {
    gsap.to(screenRef.current, {
      backgroundColor: "#D6955B",
      duration: 0.75,
      ease: "power3.inOut",
      opacity: 1
    });
  }, []);

  useGSAP(() => {
    gsap.to(mobileScreenRef.current, {
      backgroundColor: "#D6955B",
      duration: 0.75,
      ease: "power3.inOut",
      opacity: 1
    });
  }, []);

  return (
    <div ref={screenRef} className="hoolis-container" style={{backgroundColor: bgColor}}>
      <h1 ref={labelRef} className="title-label" style={{color: labelColor}}>{label}</h1>
      <div className="hoolis-images-container">
        <img src="../public/hoolis-img/mouth-tee-thomas.jpg" alt="" />
        <img src="../public/hoolis-img/mouth-tee-back.jpg" alt="" />
        <img src="../public/hoolis-img/coquillage-tee-polito.jpg" alt="" />
      </div>
      <Button screenRef={screenRef} labelRef={labelRef} />
    </div>

  );
}
