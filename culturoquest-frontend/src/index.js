import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { GameProvider } from './context/GameContext'; // <--- 1. Import this

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <GameProvider> {/* <--- 2. Wrap App with it */}
        <App />
      </GameProvider>
    </AuthProvider>
  </React.StrictMode>
);