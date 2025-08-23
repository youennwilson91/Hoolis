import { RouterProvider } from 'react-router-dom'
import router from './utils/Router'
import "./index.css"
import useStore from './utils/store'
import { useEffect } from 'react'
import { loadFont } from './utils/fontLoader'
import PasswordProtect from './components/PasswordProtect'
import Footer from './components/Footer'


function App() {
  const bgColor = useStore((state) => state.bgColor);
  const passwordProtect = import.meta.env.VITE_PASSWORD_PROTECT;
  useEffect(() => {
    // Load custom fonts
    loadFont();
    
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
    passwordProtect ? (      
      <PasswordProtect>
        <div className="app-container" style={{backgroundColor: bgColor}}>
          <RouterProvider router={router} />
          <Footer />
        </div>
      </PasswordProtect>
    ) : (
          <div className="app-container" style={{backgroundColor: bgColor}}>
            <RouterProvider router={router} />
            <Footer />
          </div>
    )
  )
}

export default App
