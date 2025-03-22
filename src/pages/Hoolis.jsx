import Button from "../components/Buttons";
import useStore from "../utils/store";
import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import "../CSS/Hoolis.css";
import "../index.css";

export default function Hoolis() {
  const screenRefHoolis = useRef(null);
  const labelRefHoolis = useRef(null);
  const { labelColor } = useStore();

  useGSAP(() => {
    gsap.to(screenRefHoolis.current, {
      backgroundColor: "#226D68",
      duration: 0.75,
      ease: "power3.inOut",
      opacity: 1
    });
  }, []);

  return (
    <div ref={screenRefHoolis} className="hoolis-container" >
      <div className="hoolis-images-container">
        <img src="../public/hoolis-img/mouth-tee-thomas.jpg" alt="" />
        <img src="../public/hoolis-img/mouth-tee-back.jpg" alt="" />
        <img src="../public/hoolis-img/coquillage-tee-polito.jpg" alt="" />
        <img src="../public/hoolis-img/marc-paulito.jpg" alt="" />
      </div>
      <Button screenRef={screenRefHoolis} labelRef={labelRefHoolis} />
    </div>
  );
}
