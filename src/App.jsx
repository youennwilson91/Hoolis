import { RouterProvider } from 'react-router-dom'
import router from './utils/Router'
import "./index.css"
import useStore from './utils/store'

function App() {
  const bgColor = useStore((state) => state.bgColor);
  return (
    <div className="app-container" style={{backgroundColor: bgColor}}>
      <RouterProvider router={router} />
    </div>
  );
}

export default App
