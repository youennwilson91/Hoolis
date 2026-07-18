import { RouterProvider } from 'react-router-dom'
import router from './utils/Router'
import "./index.css"
import useStore from './utils/store'
import { useEffect } from 'react'
import { loadFont } from './utils/fontLoader'
import PasswordProtect from './components/PasswordProtect'
import ErrorBoundary from './components/ErrorBoundary'
import { ToastProvider } from './components/Toast/ToastContainer'
import { apiClient, API_ENDPOINTS } from './utils/axiosConfig'


function App() {
  const bgColor = useStore((state) => state.bgColor);
  const setBgImageDesktop  = useStore((state) => state.setBgImageDesktop);
  const setBgImageMobile   = useStore((state) => state.setBgImageMobile);
  const setBgFit           = useStore((state) => state.setBgFit);
  const setBgPaddingTop    = useStore((state) => state.setBgPaddingTop);
  const setBgPaddingBottom = useStore((state) => state.setBgPaddingBottom);
  const setBgPaddingLeft   = useStore((state) => state.setBgPaddingLeft);
  const setBgPaddingRight  = useStore((state) => state.setBgPaddingRight);
  const setSiteConfigReady = useStore((state) => state.setSiteConfigReady);
  const passwordProtect = import.meta.env.VITE_PASSWORD_PROTECT === 'true';

  useEffect(() => {
    let mounted = true;
    apiClient.get(API_ENDPOINTS.siteConfig)
      .then(({ data }) => {
        if (!mounted) return;
        if (data.bg_image_desktop) setBgImageDesktop(data.bg_image_desktop);
        if (data.bg_image_mobile) setBgImageMobile(data.bg_image_mobile);
        if (data.bg_fit) setBgFit(data.bg_fit);
        setBgPaddingTop(data.bg_padding_top ?? 0);
        setBgPaddingBottom(data.bg_padding_bottom ?? 0);
        setBgPaddingLeft(data.bg_padding_left ?? 0);
        setBgPaddingRight(data.bg_padding_right ?? 0);
        setSiteConfigReady(true);
      })
      .catch(() => { if (mounted) setSiteConfigReady(true); });
    return () => { mounted = false; };
  }, []);

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
        </div>
      </ErrorBoundary>
    </ToastProvider>
  )
}

export default App
