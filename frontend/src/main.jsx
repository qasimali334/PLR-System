import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#13132b',
          color: '#e8e8ff',
          border: '1px solid rgba(124,111,255,0.3)',
          borderRadius: '12px',
          fontFamily: 'DM Sans, sans-serif',
        },
        success: { iconTheme: { primary: '#00e5b0', secondary: '#13132b' } },
        error: { iconTheme: { primary: '#f87171', secondary: '#13132b' } },
        duration: 4000,
      }}
    />
  </React.StrictMode>,
)
