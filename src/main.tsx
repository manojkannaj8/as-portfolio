import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/saira/wdth-italic.css'
import '@fontsource-variable/saira/wdth.css'
import '@fontsource-variable/archivo/wdth.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import './styles/tokens.css'
import './styles/base.css'
import './styles/landing.css'
import './styles/dossier.css'
import './styles/chapters.css'
import './styles/arsenal-fx.css'
import { App } from './App'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// dev-only handle for stepping timelines from the console
if (import.meta.env.DEV) Object.assign(window, { __gsap: gsap, __st: ScrollTrigger })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
