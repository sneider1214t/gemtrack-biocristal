import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { UserPoolProvider } from "./context/UserPoolContext"; // ✅ Importación del contexto

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <UserPoolProvider> {/* ✅ Aquí envolvemos toda la App */}
        <App />
      </UserPoolProvider>
    </BrowserRouter>
  </React.StrictMode>
);
