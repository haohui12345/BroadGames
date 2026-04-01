// React entry point: sets up router, global toast, and theme bootstrap.
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

try {
  const rawTheme = localStorage.getItem('theme-storage')
  const parsedTheme = rawTheme ? JSON.parse(rawTheme) : null
  const initialTheme = parsedTheme?.state?.theme || 'dark'
  document.documentElement.classList.toggle('dark', initialTheme === 'dark')
} catch {
  document.documentElement.classList.add('dark')
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { fontFamily: 'Outfit, sans-serif', fontSize: '14px' },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
)
