import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './cross-platform.css'
import App from './App.jsx'
import './utils/axiosConfig.js'  // Configuration globale d'axios
import * as Sentry from "@sentry/react"

// Initialiser Sentry uniquement en production
if (import.meta.env.PROD) {
  Sentry.init({
    dsn: "https://5dd6eb76a0e6c3b8b0f4e976742fa730@o4510934666510336.ingest.de.sentry.io/4510934672736336",
    environment: import.meta.env.VITE_ENVIRONMENT || "production",
    sendDefaultPii: true,
    tracesSampleRate: 0.1, // 10% des transactions pour les performances
    beforeSend(event) {
      // Ne pas envoyer les erreurs en développement
      if (import.meta.env.DEV) return null;
      return event;
    }
  });
}

// Fix for iOS 100vh issue
const setVhVariable = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};

// Component to handle viewport height fix
const AppWithViewportFix = () => {
  useEffect(() => {
    // Set initial value
    setVhVariable();
    
    // Update on resize
    window.addEventListener('resize', setVhVariable);
    
    // Update on orientation change (mobile specific)
    window.addEventListener('orientationchange', setVhVariable);
    
    return () => {
      window.removeEventListener('resize', setVhVariable);
      window.removeEventListener('orientationchange', setVhVariable);
    };
  }, []);
  
  return <App />;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppWithViewportFix />
  </StrictMode>,
)
