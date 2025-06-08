import "./Support.scss";
import Button from "../components/NavButtons";
import { useRef, useEffect } from "react";
import useStore from "../utils/store";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export default function Support() {

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
      backgroundColor: "#000000",
      duration: 0.75,
      ease: "power3.inOut",
      opacity: 1
    });
  }, []);

  return (
    <div ref={screenRef} className="support-container" style={{backgroundColor: bgColor}}>
      <h1 ref={labelRef} className="title-label" style={{color: labelColor}}>{label}</h1>
      <form className="support-form" action="https://formsubmit.co/youson91@hotmail.fr" method="POST">
        <input type="email" name="email" placeholder="Votre email" required />
        <input type="text" name="code" placeholder="Numero de commande" required />
        <input type="text" name="subject" placeholder="Sujet" required />
        <textarea name="message" placeholder="Votre message" required></textarea>
        <button type="submit">Envoyer</button>
      </form>
      <Button screenRef={screenRef} labelRef={labelRef} />
    </div>
  );
}
