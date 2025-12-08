import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Intercepts all relative /api/* requests and prepends the configured API base URL.
 * This allows code to use relative paths like '/api/users/me' which work with dev proxy
 * but are automatically converted to full URLs like 'https://api.setly.com/v1/users/me' in production.
 */
@Injectable()
export class ApiBaseUrlInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Only rewrite relative /api/ calls
    if (req.url.startsWith('/api/')) {
      // Remove /api prefix and prepend the full API base URL
      const apiPath = req.url.replace('/api', '');
      const fullUrl = `${environment.apiBaseUrl}${apiPath}`;
      
      const modifiedReq = req.clone({
        url: fullUrl
      });
      
      return next.handle(modifiedReq);
    }

    return next.handle(req);
  }
}
