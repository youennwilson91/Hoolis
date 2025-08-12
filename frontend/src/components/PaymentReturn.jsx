import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import useStore from '../utils/store';
import './PaymentReturn.scss';

export default function PaymentReturn() {
  const location = useLocation();
  const { 
    paymentStatus, 
    paymentMessage, 
    paymentLoading, 
    paymentProcessed,
    setPaymentStatus,
    setPaymentMessage,
    setPaymentProcessed,
    processPayment,
    resetPayment
  } = useStore();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const paymentParam = searchParams.get('payment');
    const sessionId = searchParams.get('session_id');

    console.log('PaymentReturn useEffect - paymentParam:', paymentParam, 'sessionId:', sessionId, 'paymentProcessed:', paymentProcessed);

    // Éviter les traitements multiples
    if (paymentProcessed) {
      console.log('Paiement déjà traité, sortie');
      return;
    }

    if (paymentParam === 'success' && sessionId) {
      console.log('Traitement du paiement réussi');
      setPaymentProcessed(true);
      processPayment(sessionId);
    } else if (paymentParam === 'cancelled') {
      console.log('Traitement du paiement annulé');
      setPaymentProcessed(true);
      setPaymentStatus('cancelled');
      setPaymentMessage('Paiement annulé. Vous pouvez réessayer quand vous le souhaitez.');
      
      // Nettoyer après 5 secondes
      setTimeout(() => {
        window.history.replaceState({}, document.title, window.location.pathname);
        resetPayment();
      }, 5000);
    }
  }, [location, paymentProcessed, setPaymentStatus, setPaymentMessage, setPaymentProcessed, processPayment, resetPayment]);

  // Debug: Afficher l'état actuel
  console.log('PaymentReturn render - paymentStatus:', paymentStatus, 'paymentMessage:', paymentMessage, 'paymentLoading:', paymentLoading);

  if (!paymentStatus && !paymentLoading) {
    return null; // Ne rien afficher si pas de statut de paiement
  }

  return (
    <div className="payment-return-overlay">
      <div className="payment-return-popup">
        {paymentLoading ? (
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
            <p>{paymentMessage}</p>
            <button 
              onClick={() => {
                console.log('Fermeture manuelle de la popup');
                window.history.replaceState({}, document.title, window.location.pathname);
                resetPayment();
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