import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment';
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, ErrorHandler } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthTokenInterceptor } from './core/interceptors/auth-token.interceptor';
import { PermissionErrorInterceptor } from './core/interceptors/permission-error.interceptor';

class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    console.error('Global error handler:', error);
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimationsAsync(),
    importProvidersFrom(OverlayModule),
  provideHttpClient(withInterceptorsFromDi()),
    provideRouter(routes),
    // Only initialize Firebase when config exists to avoid runtime errors in demo mode
    ...(environment?.firebase?.apiKey
      ? [
          provideFirebaseApp(() => initializeApp(environment.firebase)),
          provideAuth(() => getAuth()),
          provideFirestore(() => getFirestore())
        ]
      : []),
  { provide: HTTP_INTERCEPTORS, useClass: AuthTokenInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: PermissionErrorInterceptor, multi: true },
    { provide: ErrorHandler, useClass: GlobalErrorHandler }
  ]
};
