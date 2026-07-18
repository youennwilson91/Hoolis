import "./CartIcon.scss";

export default function CartIcon({ quantity, onClick }) {
  return (
    <div className="cart-icon" onClick={onClick}>
      <h1 className="cart-quantity">{quantity}</h1>
      <img src="/svg-cart.svg" alt="Panier" />
    </div>
  );
}
