import { useRef, useEffect } from "react";
import MenuButtons from "../components/Buttons/Menu.jsx";
import useStore from "../utils/store";
import SEOHead from "../components/SEOHead";
import StructuredData, { createWebsiteSchema, createOrganizationSchema } from "../components/StructuredData";
import PaymentReturn from "../components/PaymentReturn";
import "./Landing.scss";

export default function Landing() {
    const { bgColor, label, labelColor, buttonsVisible, setBgColor, setIsClicked, setButtonsVisible, setLabel, setMobileButtonsVisible } = useStore();
    const screenRef = useRef(null);
    const labelRef = useRef(null);
    const screenMobileRef = useRef(null);
    const menuRef1 = useRef(null);
    const menuRef2 = useRef(null);

    useEffect(() => {
        setBgColor("#000000");
        setIsClicked(false);
        setLabel("");
        setButtonsVisible(true);
        setMobileButtonsVisible(true);
    }, []);

    //function handleMenuHover({targetRef, otherRef, isEntering}) {
    //    const timeline = gsap.timeline();
//
    //    if (isEntering) {
    //        // Au hover in, l'élément survolé prend 70% et l'autre 30%
    //        timeline
    //            .to(targetRef.current, {
    //                duration: 0.5,
    //                ease: "power3.inOut",
    //                width: "85%",
    //            })
    //            .to(otherRef.current, {
    //                duration: 0.5,
    //                ease: "power3.inOut",
    //                width: "15%",
    //            }, 0); // 0 pour synchroniser les animations
    //    } else {
    //        // Au hover out, retour à 50% chacun
    //        timeline
    //            .to([targetRef.current, otherRef.current], {
    //                duration: 0.5,
    //                ease: "power3.inOut",
    //                width: "50%",
    //            });
    //    }
    //}
  
    return (  
        <>
            <SEOHead
                title="Hoolis - Boutique de Luxe | Vêtements, Maroquinerie & Montres"
                description="Découvrez l'univers Hoolis : collections exclusives de vêtements de luxe, maroquinerie haut de gamme et montres prestigieuses. Expertise française et savoir-faire d'exception."
                keywords="hoolis, luxe, vêtements de luxe, maroquinerie, montres de luxe, horlogerie, boutique luxe, mode haut de gamme, paris"
                url="https://hoolis.com/"
            />
            <StructuredData data={createWebsiteSchema()} />
            <StructuredData data={createOrganizationSchema()} />
            
            <div ref={screenRef} className="desktop-view">
                <div className="crown-container" style={{backgroundColor: bgColor}}>
                    <h1 ref={labelRef} className="title-label" style={{color: labelColor}}>{label}</h1>
                        <svg version="1.0" className="crown-svg"
                            viewBox="0 0 300 241.000000"
                            preserveAspectRatio="xMidYMid meet"
                            >
                            <g transform="translate(0.000000,241.000000) scale(0.100000,-0.100000)" fill="#efec8f" stroke="none">
                                <path d="M1730 2317 c-36 -37 -180 -279 -356 -600 -149 -270 -192 -345 -204
                                -352 -15 -9 -50 22 -162 142 -56 59 -151 162 -213 228 -61 66 -124 126 -138
                                134 -24 13 -29 12 -47 -4 -11 -10 -20 -29 -20 -42 0 -29 67 -210 208 -563 120
                                -302 158 -408 147 -418 -12 -12 -112 51 -342 214 -340 243 -397 273 -423 224
                                -15 -28 3 -59 134 -230 171 -224 675 -858 727 -914 l47 -50 168 -9 c192 -9
                                421 -3 603 17 114 13 125 16 151 42 15 16 157 218 315 449 159 231 345 499
                                413 594 69 96 130 190 135 208 9 29 7 36 -13 58 -30 32 -56 31 -160 -5 -47
                                -16 -95 -30 -108 -30 -22 0 -22 1 -7 30 9 17 54 86 100 154 133 196 156 254
                                117 289 -28 25 -53 21 -159 -27 -91 -40 -360 -155 -547 -232 -43 -18 -85 -30
                                -92 -27 -20 8 -39 78 -99 378 -62 302 -67 320 -97 352 -29 31 -39 29 -78 -10z
                                m78 -67 c6 -25 34 -161 62 -302 28 -142 61 -288 73 -325 l23 -68 40 1 c23 0
                                83 20 149 48 61 27 175 75 255 108 80 33 193 82 252 109 59 27 112 49 118 49
                                33 0 -22 -103 -165 -310 -126 -182 -131 -207 -42 -196 28 4 97 22 152 41 147
                                49 153 36 50 -105 -65 -90 -388 -555 -643 -927 -138 -200 -156 -223 -185 -227
                                -163 -27 -705 -40 -819 -21 -36 6 -55 28 -360 413 -371 466 -578 735 -573 740
                                6 6 138 -79 290 -187 366 -261 485 -335 508 -312 20 20 -26 167 -159 499 -126
                                317 -214 548 -214 564 0 23 35 -11 223 -214 112 -123 230 -247 261 -277 l57
                                -53 24 22 c27 25 74 103 155 255 97 181 326 582 397 694 40 62 53 58 71 -19z"/>
                            </g>
                        </svg>
                    <div className="landing-menus">
                        <div 
                            className="landing-menu-item" 
                            ref={menuRef1}
                        >
                            <img src="/hoolis-img/coquillage-tee-polito.jpg" alt="Maison Hoolis" loading="lazy" />
                        </div>
                    </div>
                    {buttonsVisible && <MenuButtons screenRef={screenRef} labelRef={labelRef} buttonsPosition="landing" />}
                </div>
            </div>

            <div ref={screenMobileRef} className="mobile-view">
                <div className="mobile-landing"> 
                    <img src="/hoolis-img/coquillage-tee-polito.jpg" alt="Maison Hoolis" loading="lazy" />
                    <svg version="1.0" className="crown-svg"
                            viewBox="0 0 300 241.000000"
                            preserveAspectRatio="xMidYMid meet"
                            >
                            <g transform="translate(0.000000,241.000000) scale(0.100000,-0.100000)" fill="#efec8f" stroke="none">
                                <path d="M1730 2317 c-36 -37 -180 -279 -356 -600 -149 -270 -192 -345 -204
                                -352 -15 -9 -50 22 -162 142 -56 59 -151 162 -213 228 -61 66 -124 126 -138
                                134 -24 13 -29 12 -47 -4 -11 -10 -20 -29 -20 -42 0 -29 67 -210 208 -563 120
                                -302 158 -408 147 -418 -12 -12 -112 51 -342 214 -340 243 -397 273 -423 224
                                -15 -28 3 -59 134 -230 171 -224 675 -858 727 -914 l47 -50 168 -9 c192 -9
                                421 -3 603 17 114 13 125 16 151 42 15 16 157 218 315 449 159 231 345 499
                                413 594 69 96 130 190 135 208 9 29 7 36 -13 58 -30 32 -56 31 -160 -5 -47
                                -16 -95 -30 -108 -30 -22 0 -22 1 -7 30 9 17 54 86 100 154 133 196 156 254
                                117 289 -28 25 -53 21 -159 -27 -91 -40 -360 -155 -547 -232 -43 -18 -85 -30
                                -92 -27 -20 8 -39 78 -99 378 -62 302 -67 320 -97 352 -29 31 -39 29 -78 -10z
                                m78 -67 c6 -25 34 -161 62 -302 28 -142 61 -288 73 -325 l23 -68 40 1 c23 0
                                83 20 149 48 61 27 175 75 255 108 80 33 193 82 252 109 59 27 112 49 118 49
                                33 0 -22 -103 -165 -310 -126 -182 -131 -207 -42 -196 28 4 97 22 152 41 147
                                49 153 36 50 -105 -65 -90 -388 -555 -643 -927 -138 -200 -156 -223 -185 -227
                                -163 -27 -705 -40 -819 -21 -36 6 -55 28 -360 413 -371 466 -578 735 -573 740
                                6 6 138 -79 290 -187 366 -261 485 -335 508 -312 20 20 -26 167 -159 499 -126
                                317 -214 548 -214 564 0 23 35 -11 223 -214 112 -123 230 -247 261 -277 l57
                                -53 24 22 c27 25 74 103 155 255 97 181 326 582 397 694 40 62 53 58 71 -19z"/>
                            </g>
                    </svg>
                    <MenuButtons 
                        screenRef={screenMobileRef} 
                        labelRef={labelRef} 
                        buttonsPosition="landing"
                    />
                </div>
            </div>
        </>
    );
}


