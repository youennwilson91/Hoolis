import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { apiClient } from '../utils/axiosConfig';
import './PaymentReturn.scss';

export default function PaymentReturn() {
  const location = useLocation();
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const paymentParam = searchParams.get('payment');
    const sessionId = searchParams.get('session_id');

    if (paymentParam === 'success' && sessionId) {
      verifyPayment(sessionId);
    } else if (paymentParam === 'cancelled') {
      setPaymentStatus('cancelled');
      setMessage('Paiement annulé. Vous pouvez réessayer quand vous le souhaitez.');
    }
  }, [location]);

  const verifyPayment = async (sessionId) => {
    setIsLoading(true);
    try {
      console.log('Vérification du paiement...', sessionId);
      
      const response = await apiClient.post('/store/verify-payment/', {
        session_id: sessionId
      });

      console.log('Résultat de la vérification:', response.data);

      if (response.data.status === 'success') {
        setPaymentStatus('success');
        setMessage('🎉 Paiement confirmé ! Un email de confirmation a été envoyé.');
      } else if (response.data.status === 'pending') {
        setPaymentStatus('pending');
        setMessage('⏳ Paiement en cours de traitement...');
      } else {
        setPaymentStatus('failed');
        setMessage('❌ Échec du paiement. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du paiement:', error);
      setPaymentStatus('error');
      setMessage('❌ Erreur lors de la vérification du paiement.');
    } finally {
      setIsLoading(false);
      
      // Nettoyer l'URL après 3 secondes
      setTimeout(() => {
        window.history.replaceState({}, document.title, window.location.pathname);
        setPaymentStatus(null);
        setMessage('');
      }, 5000);
    }
  };

  if (!paymentStatus && !isLoading) {
    return null; // Ne rien afficher si pas de statut de paiement
  }

  return (
    <div className="payment-return-overlay">
      <div className="payment-return-popup">
        {isLoading ? (
          <div className="payment-loading">
            <div className="spinner"></div>
            <p>Vérification du paiement en cours...</p>
          </div>
        ) : (
          <div className={`payment-status payment-${paymentStatus}`}>
            <h3>
              {paymentStatus === 'success' && '✅ Paiement réussi'}
              {paymentStatus === 'pending' && '⏳ Paiement en cours'}
              {paymentStatus === 'failed' && '❌ Paiement échoué'}
              {paymentStatus === 'cancelled' && '🚫 Paiement annulé'}
              {paymentStatus === 'error' && '⚠️ Erreur'}
            </h3>
            <p>{message}</p>
            <button 
              onClick={() => {
                window.history.replaceState({}, document.title, window.location.pathname);
                setPaymentStatus(null);
                setMessage('');
              }}
              className="close-payment-popup"
            >
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 