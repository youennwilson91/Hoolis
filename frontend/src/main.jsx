import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './cross-platform.css'
import App from './App.jsx'

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
