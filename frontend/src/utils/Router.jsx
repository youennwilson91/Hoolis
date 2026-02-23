import { createBrowserRouter } from 'react-router-dom';
import Landing from '../pages/others/Landing';
import About from '../pages/others/About';
import Hoolis from '../pages/hoolis/Hoolis';
import Resell from '../pages/resell/Resell';
import Gallery from '../pages/others/Gallery';

const router = createBrowserRouter([

  // Landing
  //{path: '/', element: <Landing />},
  {path: '/about', element: <About />},
  //{path: '/resell', element: <Resell />},
  //{path: '/gallery', element: <Gallery />},
  //{path: '/hoolis', element: <Hoolis />},
  {path: '/', element: <Hoolis />},
]);

export default router;

