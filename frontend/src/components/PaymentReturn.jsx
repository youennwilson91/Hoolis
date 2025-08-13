import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { apiClient } from '../utils/axiosConfig';
import './PaymentReturn.scss';

export default function PaymentReturn() {
  const location = useLocation();
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const payment = params.get('payment');
    const sessionId = params.get('session_id');

    if (payment === 'success' && sessionId) {
      verifyPayment(sessionId);
    } else if (payment === 'cancelled') {
      setPaymentStatus('cancelled');
      setMessage('Paiement annulé');
    }
  }, []);

  const verifyPayment = async (sessionId) => {
    try {
      const response = await apiClient.post('/store/verify-payment/', {
        session_id: sessionId
      });

      if (response.data.status === 'success') {
        setPaymentStatus('success');
        setMessage('Paiement confirmé !');
      } else {
        setPaymentStatus('failed');
        setMessage('Paiement échoué');
      }
    } catch (error) {
      setPaymentStatus('failed');
      setMessage('Erreur de vérification');
    }
  };

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
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
} 