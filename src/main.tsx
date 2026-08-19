import React from 'react';
import ReactDOM from 'react-dom/client';
import { inject } from '@vercel/analytics';
import { Analytics } from '@vercel/analytics/react';
import App from './App';
import './index.css';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// Initialize Vercel Analytics
inject();

// Register Service Worker for offline Practice and Daily Drill caching
serviceWorkerRegistration.register({
  onSuccess: () => console.log('[Edulpha] App is ready for offline study.'),
  onUpdate: () => console.log('[Edulpha] New study material cache version ready.')
});

// Handle chunk load errors (common in SPAs when a new version is deployed)
window.addEventListener('error', (e) => {
  if (e.message?.includes('Failed to fetch dynamically imported module') || 
      e.message?.includes('Importing a module script failed')) {
    console.warn('Chunk load error detected, reloading page...', e);
    window.location.reload();
  }
}, true);

// Also handle unhandled promise rejections for dynamic imports
window.addEventListener('unhandledrejection', (e) => {
  if (e.reason?.message?.includes('Failed to fetch dynamically imported module') || 
      e.reason?.message?.includes('Importing a module script failed')) {
    console.warn('Chunk load error (promise) detected, reloading page...', e);
    window.location.reload();
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Analytics />
  </React.StrictMode>
);
