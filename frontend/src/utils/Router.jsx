import { createBrowserRouter } from 'react-router-dom';
import Landing from '../pages/Landing';
import About from '../pages/About';
import Shop from '../pages/Shop';
import FandW from '../pages/FandW';
import Gallery from '../pages/Gallery';

const router = createBrowserRouter([

  // Landing
  {path: '/', element: <Landing />},
  //{path: '/about', element: <About />},
  {path: '/fw', element: <FandW />},
  {path: '/gallery', element: <Gallery />},
  {path: '/hoolis', element: <Shop />},
]);

export default router;

