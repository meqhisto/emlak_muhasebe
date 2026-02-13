import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  // <App />
  <div style={{ padding: 20, textAlign: 'center' }}>
    <h1>React Çalışıyor</h1>
    <p>Bu ekran görünüyorsa React kütüphanesi sağlamdır.</p>
  </div>
);