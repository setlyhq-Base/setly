import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, retry } from 'rxjs';
import { ToastService } from '../services/toast.service';

/**
 * Global HTTP Error Interceptor
 * Automatically handles API errors and shows toast notifications
 * 
 * Features:
 * - Retry failed requests (except POST/PUT/DELETE)
 * - Show user-friendly error messages
 * - Log errors for debugging
 * - Handle specific error codes (401, 403, 404, 500)
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    // Retry GET requests once on network errors
    retry({
      count: req.method === 'GET' ? 1 : 0,
      delay: 1000,
    }),
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred';

      if (error.error instanceof ErrorEvent) {
        // Client-side or network error
        errorMessage = `Network error: ${error.error.message}`;
        console.error('Client-side error:', error.error);
      } else {
        // Backend returned an unsuccessful response code
        console.error(`Backend error ${error.status}:`, error);

        switch (error.status) {
          case 0:
            errorMessage = 'Unable to connect to server. Please check your internet connection.';
            break;
          case 400:
            errorMessage = error.error?.message || 'Invalid request. Please check your input.';
            break;
          case 401:
            errorMessage = 'You are not authenticated. Please sign in.';
            // TODO: Redirect to login page
            break;
          case 403:
            errorMessage = 'You do not have permission to perform this action.';
            break;
          case 404:
            errorMessage = error.error?.message || 'The requested resource was not found.';
            break;
          case 429:
            errorMessage = 'Too many requests. Please try again later.';
            break;
          case 500:
            errorMessage = 'Server error. Our team has been notified.';
            break;
          case 503:
            errorMessage = 'Service temporarily unavailable. Please try again later.';
            break;
          default:
            errorMessage = error.error?.message || `Error ${error.status}: ${error.statusText}`;
        }
      }

      // Show toast notification for errors
      // Skip toasts for certain endpoints to avoid spam
      const skipToastPaths = ['/api/conversations']; // Polling endpoints
      const shouldShowToast = !skipToastPaths.some(path => req.url.includes(path));
      
      if (shouldShowToast) {
        toastService.error(errorMessage);
      }

      return throwError(() => new Error(errorMessage));
    })
  );
};

/**
 * Global Error Handler Service
 * Catches uncaught exceptions and provides graceful error handling
 */
import { ErrorHandler, Injectable } from '@angular/core';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private toastService = inject(ToastService);

  handleError(error: Error): void {
    console.error('Global error:', error);

    // Show user-friendly message
    const message = this.getUserFriendlyMessage(error);
    this.toastService.error(message);

    // In production, you might want to send errors to a logging service
    // e.g., Sentry, LogRocket, etc.
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error);
    }
  }

  private getUserFriendlyMessage(error: Error): string {
    // Check for specific error types
    if (error.message.includes('ChunkLoadError')) {
      return 'A new version is available. Please refresh the page.';
    }
    
    if (error.message.includes('Network')) {
      return 'Network error. Please check your connection.';
    }

    // Generic message for unknown errors
    return 'Something went wrong. Please try again.';
  }
}
