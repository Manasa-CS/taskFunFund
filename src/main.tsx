import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { requestPersistentStorage } from '@/store/storage'
import './index.css'
import App from './App.tsx'

requestPersistentStorage()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
