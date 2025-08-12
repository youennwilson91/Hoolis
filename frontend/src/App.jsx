import { RouterProvider } from 'react-router-dom'
import router from './utils/Router'
import "./index.css"
import useStore from './utils/store'
import { useEffect } from 'react'
import { loadFont } from './utils/fontLoader'
import PasswordProtect from './components/PasswordProtect'
import Footer from './components/Footer'

// Simple touch events polyfill for better cross-platform support
const enableTouchSupport = () => {
  // For older versions of Windows that may not fully support touch
  if (window.navigator.msPointerEnabled) {
    document.documentElement.className += ' ms-touch';
  }
  
  // Check if we're on a touch device
  const isTouchDevice = ('ontouchstart' in window) || 
                        (navigator.maxTouchPoints > 0) || 
                        (navigator.msMaxTouchPoints > 0);
  
  if (isTouchDevice) {
    document.documentElement.classList.add('touch-device');
  } else {
    document.documentElement.classList.add('no-touch');
  }
};

function App() {
  const bgColor = useStore((state) => state.bgColor);
  
  useEffect(() => {
    // Load custom fonts
    loadFont();
    
    // Enable cross-platform touch support
    enableTouchSupport();
    
    // Prevent double-tap zoom on mobile devices
    document.addEventListener('touchstart', function(event){
      if (event.touches.length > 1) {
        event.preventDefault();
      }
    }, { passive: false });
    
    return () => {
      document.removeEventListener('touchstart', function(){}, { passive: false });
    };
  }, []);
  
  return (
    <PasswordProtect>
      <div className="app-container" style={{backgroundColor: bgColor}}>
        <RouterProvider router={router} />
        <Footer />
      </div>
    </PasswordProtect>
  );
}

export default App
