import { createBrowserRouter } from 'react-router-dom';
import Landing from '../pages/Landing';
import About from '../pages/About';
import Shop from '../pages/Shop';
import FandW from '../pages/FandW';
import Support from '../pages/Support';
import Hoolis from '../pages/Hoolis';

const router = createBrowserRouter([

  // Landing
  {path: '/', element: <Landing />},
  {path: '/about', element: <About />},
  {path: '/shop', element: <Shop />},
  {path: '/fw', element: <FandW />},
  {path: '/gallery', element: <Hoolis />},
  {path: '/support', element: <Support />},
  {path: '/hoolis', element: <Hoolis />},
]);

export default router;

