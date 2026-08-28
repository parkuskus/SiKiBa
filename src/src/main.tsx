import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { supabase } from './data/supabase.ts'
import './index.css'
import App from './App.tsx'

console.log(await supabase.from('profiles').select('*'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
