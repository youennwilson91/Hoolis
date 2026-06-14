import { useCallback, useMemo } from "react";
import useStore from "../utils/store.jsx";
import { useToast } from "../components/Toast/ToastContainer";

export default function useCart() {
  const { addToCart, setAddToCart } = useStore();
  const { addToast } = useToast();

  const handleAddToCart = useCallback((article, e) => {
    e.stopPropagation();
    setAddToCart(prevCart => {
      return [...prevCart, { ...article, cartid: Date.now() + Math.random() }];
    });
    addToast("Article ajouté au panier", "success");
  }, [setAddToCart, addToast]);

  const handleRemoveItem = useCallback((item) => {
    setAddToCart(prevCart => prevCart.filter(
      cartItem => cartItem.cartid !== item.cartid
    ));
  }, [setAddToCart]);

  const cartTotal = useMemo(() => {
    return addToCart.reduce((total, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = item.quantity || 1;
      return total + (price * quantity);
    }, 0);
  }, [addToCart]);

  const cartAsItem = useMemo(() => {
    // Trouver le premier article avec une image valide
    const firstItemWithImage = addToCart.find(item => item.images?.[0]?.image);

    return {
      id: 'cart',
      name: `Commande (${addToCart.length} article${addToCart.length > 1 ? 's' : ''})`,
      price: cartTotal,
      wide: firstItemWithImage?.images?.[0]?.image ? [{ media: firstItemWithImage.images[0].image }] : [],
      isCart: true,
      cartItems: addToCart
    };
  }, [addToCart, cartTotal]);

  return {
    addToCart,
    handleAddToCart,
    handleRemoveItem,
    cartTotal,
    cartAsItem
  };
}
