import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Importing global styles
import App from './App';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from './components/ErrorBoundary';
import { initSentry } from './lib/sentry';

initSentry();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <App />
  </ErrorBoundary>
);



// Register Service Worker for Offline Mode
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Solo habilitar el service worker completo en producción o si explícitamente se requiere.
    // En desarrollo (Vite localhost), el SW de cache causa problemas como chunks sin encontrar.
    if (import.meta.env.DEV) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (let registration of registrations) {
          registration.unregister();
          console.log('🗑️ Dev mode: SW unregistrado para evitar bug de cache');
        }
      });

      // Además, limpiar las memorias caché almacenadas previamente
      caches.keys().then((cacheNames) => {
        cacheNames.forEach(cacheName => {
          caches.delete(cacheName);
          console.log('🗑️ Dev mode: Cache eliminada -', cacheName);
        });
      });
      return; // No instalar
    }

    navigator.serviceWorker.register('/sw.js?v=1.2.1')
      .then(reg => {
        console.log('🚀 Nova SW Registered!', reg.scope);
        // Check if there is already a waiting service worker
        if (reg.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      })
      .catch(err => console.error('⚠️ SW registration failed:', err));
  });
}