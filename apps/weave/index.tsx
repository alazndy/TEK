import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './src/i18n';
import { AuthProvider } from './src/context/auth-context';
import { SocketProvider } from './src/context/socket-context';


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <SocketProvider>
        <App />
      </SocketProvider>
    </AuthProvider>
  </React.StrictMode>
);