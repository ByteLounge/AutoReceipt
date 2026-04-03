import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Basic error logging to catch white screen causes
window.onerror = function(message, source, lineno) {
  alert("Runtime Error: " + message + "\nAt: " + source + ":" + lineno);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
