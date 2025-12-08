import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { environment } from './environments/environment';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));

// Register lightweight service worker for PWA behaviour (only in production)
// Temporarily disabled - will enable after fixing 404 issues
/*
if ('serviceWorker' in navigator && environment && environment.production) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(reg => console.log('✅ Service worker registered:', reg.scope))
    .catch(err => console.warn('⚠️ Service worker registration failed:', err));
}
*/
