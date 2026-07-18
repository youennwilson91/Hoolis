import { useLocation, useNavigate } from "react-router-dom";
import useStore from "../../utils/store";
import {useState, useEffect} from "react";
import "../../index.css";
import "./MenuMobile.scss";
import InstagramButton from "./InstagramButton";
import SupportButton from "./SupportButton";
import VintedButton from "./VintedButton";
import NavigationButtons from "./NavigationButtons";
import AboutButton from "./AboutButton";



function MainButton() {
  const menuOpen = useStore(state => state.menuOpen);
  const setMenuOpen = useStore(state => state.setMenuOpen);
  const navigate = useNavigate();
  const pathname = useLocation().pathname;

  const handleClick = () => {
    if (pathname === "/") {
      setMenuOpen(!menuOpen);
    } else {
      navigate("/");
    }
  };

  return (
    <button
    className="main-button"
    onClick={handleClick}
  >
    <svg version="1.0" className="crown-svg"
        width="100%" height="100%" viewBox="0 0 300 241.000000"
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
  </button>
  )
}

export default function MenuButtons({ screenRef }) {

    const setMobileButtonsVisible = useStore(state => state.setMobileButtonsVisible);
    const menuOpen = useStore(state => state.menuOpen);
    const setMenuOpen = useStore(state => state.setMenuOpen);

    const location = useLocation();
    
    useEffect(() => {
      location.pathname !== "/" ? setMobileButtonsVisible(false) : setMobileButtonsVisible(true);
    }, []);

    useEffect(() => {
      setMenuOpen(false);
    }, []);

    return (
    <>
      <div className="buttons-container">
        {/*location.pathname === "/" ? (
          // Page d'accueil - afficher les deux options de navigation
          <>
            <MainButton />
            {menuOpen && (
              <div className="buttons-div">
                <NavigationButtons screenRef={screenRef} homeTo="/hoolis" image="/hoolis-logo.png" label="Maison Hoolis"/>
                <NavigationButtons screenRef={screenRef} homeTo="/fw" image="/fw-logo.png" label="Franck & Watch"/>
                <VintedButton />
                <InstagramButton />
                <SupportButton />
              </div>
            )}
          </>
        ) : */}
        { location.pathname.includes("/") ? (
          // Page Hoolis - afficher le menu spécifique Hoolis
          <>
            <MainButton />
            {menuOpen && (
              <div className="buttons-div">
                {/*<NavigationButtons screenRef={screenRef} homeTo="/resell" image="/fw-logo.png" label="Franck & Watch"/>*/}
                <VintedButton />
                <InstagramButton />
                <SupportButton />
                <AboutButton screenRef={screenRef} />
              </div>
            )}
          </>
        ) : location.pathname.includes("/resell") ? (
          // Page Franck & Watch - afficher le menu spécifique FW
          <>
            <MainButton />
            {menuOpen && (
              <div className="buttons-div">
                <NavigationButtons screenRef={screenRef} homeTo="/hoolis" image="/hoolis-logo.png" label="Maison Hoolis"/>
                <VintedButton />
                <InstagramButton />
                <SupportButton />
              </div>
            )}
          </>
        ) : location.pathname.includes("/resell") ? (
          // Page Resell - afficher le menu spécifique Resell
          <>
            <MainButton />
            {menuOpen && (
              <div className="buttons-div">
                <NavigationButtons screenRef={screenRef} homeTo="/hoolis" image="/hoolis-logo.png" label="Maison Hoolis"/>
                <NavigationButtons screenRef={screenRef} homeTo="/fw" image="/fw-logo.png" label="Franck & Watch"/>
                <VintedButton />
                <InstagramButton />
                <SupportButton />
              </div>
            )}
          </>
        ) : null}
      </div>
    </>
    )
}