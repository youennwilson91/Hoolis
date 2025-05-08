import Button from "../components/NavButtons";
import useStore from "../utils/store";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import "./Shop.scss";
import axios from "axios";

export default function ShopMobile({ labelRef, handleAddToCart, handleRemoveItem }) {
  const mobileScreenRef = useRef(null);
  const mobileCartRef = useRef(null);
  
  const { 
    cartVisible, setCartVisible, 
    addToCart,
    products, setProducts
  } = useStore();

  useGSAP(() => {
    gsap.to(mobileScreenRef.current, {
      backgroundColor: "#D6955B",
      duration: 0.75,
      ease: "power3.inOut",
      opacity: 1
    });
  }, []);

  function handleOpenMobileCart() {
    setCartVisible(true);
    requestAnimationFrame(() => {
      if (mobileCartRef.current) {
        gsap.to(mobileCartRef.current, {
          duration: 0.5,
          ease: "power3.inOut",
          opacity: 1,
          immediateRender: false
        });
      }
    });
  }

  function handleCloseMobileCart() {
    if (mobileCartRef.current) {
      gsap.to(mobileCartRef.current, {
        duration: 0.5,
        ease: "power3.inOut",
        opacity: 0,
        onComplete: () => {
          setCartVisible(false);
          if (mobileCartRef.current) {
            mobileCartRef.current.style.opacity = 0;
          }
        }
      });
    }
  }

  return (
    <div ref={mobileScreenRef} className="mobile-shop-container">
      <div className="mobile-shop-articles">
        {Array.isArray(products) && products.length > 0 ? (
          products.map((article) => (
            <div key={article.id} className="mobile-shop-article">
              <div className="mobile-shop-article-image-container">
                <img 
                  src={article.images?.[0]?.image || '/path/to/default/image.jpg'} 
                  alt={`${article.title || 'Montre de luxe'} - Vue principale - Collection Hoolis`}
                  loading="lazy"
                />
                <img 
                  src={article.images?.[1]?.image || '/path/to/default/image.jpg'} 
                  alt={`${article.title || 'Montre de luxe'} - Vue détaillée - Collection Hoolis`}
                  loading="lazy"
                />

                <div className="mobile-shop-article-details">
                  <h1>{article.title}</h1>
                  <h1>{article.price}€</h1>
                  <h1 className="add-to-cart" onClick={() => handleAddToCart(article)}>SHOP</h1>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div>Loading products...</div>
        )}

        <div className="cart-icon" onClick={handleOpenMobileCart}>
          <h1 className="cart-quantity">{addToCart.length}</h1>
          <svg viewBox="0 0 32 32">
            <title/>
            <g data-name="Layer 2" id="Layer_2">
              <path d="M23.52,29h-15a5.48,5.48,0,0,1-5.31-6.83L6.25,9.76a1,1,0,0,1,1-.76H24a1,1,0,0,1,1,.7l3.78,12.16a5.49,5.49,0,0,1-.83,
              4.91A5.41,5.41,0,0,1,23.52,29ZM8,11,5.11,22.65A3.5,3.5,0,0,0,8.48,27h15a3.44,3.44,0,0,0,2.79-1.42,3.5,3.5,0,0,0,.53-3.13L23.28,11Z"/>
              <path d="M20,17a1,1,0,0,1-1-1V8a3,3,0,0,0-6,0v8a1,1,0,0,1-2,0V8A5,5,0,0,1,21,8v8A1,1,0,0,1,20,17Z"/>
            </g>
          </svg>
        </div>

        {cartVisible && 
        <div className="cart-container" ref={mobileCartRef} style={{ opacity: 0 }}>
          <div className="bg-cart"></div>
          <button className="close-cart" onClick={handleCloseMobileCart}>CLOSE</button>
          {/* <hr className="cart-hr-top"/> */}
          <div className="cart-items">
            {addToCart.map((item) => (
              <div key={item.cartid} className="cart-item">
                <img src={item.images[0].image} alt={item.title} />
                <h2 className="cart-item-title">{item.title}</h2>
                <div className="cart-item-details">
                  <p>{item.price}</p>
                  <h2 
                    className="remove-item" 
                    onClick={() => handleRemoveItem(item)}
                  >
                    REMOVE
                  </h2>
                </div>
              </div>
            ))}
          </div>
          {/* <hr className="cart-hr-bottom"/> */}
          <h1 className="cart-title">TOTAL : {addToCart.reduce((total, item) => {
            const price = parseInt(item.price);
            const quantity = item.quantity || 1;
            return total + (price * quantity);
          }, 0)}€</h1>
        </div>
        }
      </div>
      <Button screenRef={mobileScreenRef} labelRef={labelRef} />
    </div>
  );
} 