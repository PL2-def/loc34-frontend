/**
 * @file main.jsx
 * @description Frontend Entry Point. Mounts the React 19 application to the DOM.
 * Global styles are imported here.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
