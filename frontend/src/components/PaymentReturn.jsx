import { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import useStore from '../utils/store';
import './PaymentReturn.scss';

export default function PaymentReturn() {
  const location = useLocation();
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [message, setMessage] = useState('');
  const hasProcessed = useRef(false);
  const clearCart = useStore(state => state.clearCart);

  const verifyPayment = useCallback(async (sessionId) => {
    // Le webhook Stripe crée la commande automatiquement côté serveur
    // Pas besoin d'appel API, juste afficher la confirmation
    setPaymentStatus('success');
    setMessage('Merci pour votre commande ! Vous recevrez un email avec les détails.');
    // Vider le panier via le hook
    clearCart();
  }, [clearCart]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const payment = params.get('payment');
    const sessionId = params.get('session_id');

    if (payment === 'success' && sessionId && !hasProcessed.current) {
      hasProcessed.current = true;
      verifyPayment(sessionId);
    } else if (payment === 'cancelled') {
      setPaymentStatus('cancelled');
      setMessage('Paiement annulé');
    }
  }, [location.search, verifyPayment]);

  const closePopup = () => {
    window.history.replaceState({}, document.title, window.location.pathname);
    setPaymentStatus(null);
    setMessage('');
  };

  if (!paymentStatus) return null;

  return (
    <div className="payment-return-overlay">
      <div className="payment-return-popup">
        <div className={`payment-status payment-${paymentStatus}`}>
          <h3>
            {paymentStatus === 'success' && '✅ Paiement réussi'}
            {paymentStatus === 'failed' && '❌ Paiement échoué'}
            {paymentStatus === 'cancelled' && '🚫 Paiement annulé'}
          </h3>
          <p>{message}</p>
          <button onClick={closePopup} className="close-payment-popup">
            X
          </button>
        </div>
      </div>
    </div>
  );
} 