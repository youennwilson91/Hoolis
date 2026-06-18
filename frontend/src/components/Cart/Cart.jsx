import { useRef, useEffect, forwardRef } from "react";
import { gsap } from "gsap";
import useCart from "../../hooks/useCart";
import { useToast } from "../Toast/ToastContainer";
import "./Cart.scss";

const Cart = forwardRef(({ isOpen, onClose, onCheckout }, ref) => {
  const cartRef = ref || useRef(null);
  const { addToCart, handleRemoveItem, cartTotal } = useCart();
  const { addToast } = useToast();

  useEffect(() => {
    if (isOpen && cartRef.current) {
      requestAnimationFrame(() => {
        gsap.to(cartRef.current, {
          duration: 0.5,
          ease: "power3.inOut",
          opacity: 1,
          immediateRender: false
        });
      });
    }
  }, [isOpen]);

  const handleCheckoutClick = () => {
    if (addToCart.length === 0) {
      addToast("Votre panier est vide", "warning");
      return;
    }
    onCheckout();
  };

  if (!isOpen) return null;

  return (
    <div className="cart-container" ref={cartRef} style={{ opacity: 0 }}>
      <div className="bg-cart"></div>
      <button className="close-cart" onClick={onClose} aria-label="Fermer le panier">✕</button>
      <div className="cart-items">
        {addToCart.length === 0 && (
          <div className="cart-item">
            <h2 className="cart-item-title">Votre panier est vide</h2>
          </div>
        )}
        {addToCart.map((item) => (
          <div key={item.cartid} className="cart-item">
            <img
              src={item.images[0].image}
              alt={`${item.title} - Article de luxe Hoolis dans le panier`}
              loading="lazy"
            />
            <h2 className="cart-item-title">{item.title}</h2>
            <div className="cart-item-details">
              <p>{item.price}€</p>
              <button
                className="remove-item-btn"
                onClick={() => handleRemoveItem(item)}
                aria-label="Supprimer l'article"
              >
                <img src="/svg-poubelle.svg" alt="" className="trash-icon" />
              </button>
            </div>
          </div>
        ))}
      </div>
      {addToCart.length > 0 && (
        <button className="checkout-button" onClick={handleCheckoutClick}>
          COMMANDER - {cartTotal}€
        </button>
      )}
    </div>
  );
});

Cart.displayName = 'Cart';

export default Cart;
