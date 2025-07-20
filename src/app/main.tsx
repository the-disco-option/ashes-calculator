import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { FactoryProvider } from '../lib/FactoryProvider'

// Providers go here

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FactoryProvider>
      <App />
    </FactoryProvider>
  </StrictMode>
)
