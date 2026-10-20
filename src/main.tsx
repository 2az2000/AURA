import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App'
import { detectWebGL } from './hooks/useMediaQuery'

// CSS hook: lets stylesheets hide WebGL-only affordances (e.g. drag zones) when 3D is unavailable.
document.documentElement.dataset.webgl = String(detectWebGL())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
