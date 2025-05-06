/* import { StrictMode } from 'react' */
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { DebugProvider } from './utils/DebugContext.js'

createRoot(document.getElementById('root')).render(
  <DebugProvider>
    <App />
  </DebugProvider>
);
