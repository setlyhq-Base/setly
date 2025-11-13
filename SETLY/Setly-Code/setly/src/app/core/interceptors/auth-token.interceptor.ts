import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { from, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Only attach token for our API calls
    const isApiCall = req.url.startsWith('/api/') || /\/api\//.test(req.url);
    if (!isApiCall) {
      return next.handle(req);
    }

    // If the request already has an Authorization header, respect it (caller provided a token)
    if (req.headers.has('Authorization')) {
      return next.handle(req);
    }

    return from(this.authService.getIdToken()).pipe(
      switchMap((token) => {
        if (token) {
          const authReq = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
          });
          return next.handle(authReq);
        }
        return next.handle(req);
      })
    );
  }
}
