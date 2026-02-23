import { RouterProvider } from 'react-router-dom'
import router from './utils/Router'
import "./index.css"
import useStore from './utils/store'
import { useEffect } from 'react'
import { loadFont } from './utils/fontLoader'
import PasswordProtect from './components/PasswordProtect'
import Footer from './components/Footer'
import ErrorBoundary from './components/ErrorBoundary'
import { ToastProvider } from './components/Toast/ToastContainer'


function App() {
  const bgColor = useStore((state) => state.bgColor);
  const passwordProtect = import.meta.env.VITE_PASSWORD_PROTECT === 'true';

  useEffect(() => {
    // Load custom fonts
    loadFont();

    // Prevent double-tap zoom on mobile devices
    const handleTouchStart = (event) => {
      if (event.touches.length > 1) {
        event.preventDefault();
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: false });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart, { passive: false });
    };
  }, []);
  
  return (
    <ToastProvider>
      <ErrorBoundary>
        <div className="app-container" style={{backgroundColor: bgColor}}>
          <RouterProvider router={router} />
          <Footer />
        </div>
      </ErrorBoundary>
    </ToastProvider>
  )
}

export default App
