import { useCallback, useMemo } from "react";
import useStore from "../utils/store.jsx";

export default function useCart() {
  const { addToCart, setAddToCart } = useStore();

  const handleAddToCart = useCallback((article, e) => {
    e.stopPropagation();
    setAddToCart(prevCart => {
      return [...prevCart, { ...article, cartid: Date.now() + Math.random() }];
    });
    alert("Article ajouté au panier");
  }, [setAddToCart]);

  const handleRemoveItem = useCallback((item) => {
    setAddToCart(prevCart => prevCart.filter(
      cartItem => cartItem.cartid !== item.cartid
    ));
  }, [setAddToCart]);

  const cartTotal = useMemo(() => {
    return addToCart.reduce((total, item) => {
      const price = parseInt(item.price);
      const quantity = item.quantity || 1;
      return total + (price * quantity);
    }, 0);
  }, [addToCart]);

  const cartAsItem = useMemo(() => ({
    id: 'cart',
    name: `Commande (${addToCart.length} article${addToCart.length > 1 ? 's' : ''})`,
    price: cartTotal,
    wide: addToCart.length > 0 ? [{ media: addToCart[0].images[0].image }] : [],
    isCart: true,
    cartItems: addToCart
  }), [addToCart, cartTotal]);

  return {
    addToCart,
    handleAddToCart,
    handleRemoveItem,
    cartTotal,
    cartAsItem
  };
}
