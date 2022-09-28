import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { ActionCableProvider } from 'react-actioncable-provider'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ActionCableProvider url={'ws://localhost:3000/cable'}>
      <App />
    </ActionCableProvider>
  </React.StrictMode >
)
