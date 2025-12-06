import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../services/auth.service';

@Injectable()
export class PermissionErrorInterceptor implements HttpInterceptor {
  private toast = inject(ToastService);
  private auth = inject(AuthService);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((err: any) => {
        if (err instanceof HttpErrorResponse) {
          const msg = String(err.error?.error || err.error?.message || err.message || '').toLowerCase();
          if (err.status === 403 || /permission|denied/.test(msg)) {
            this.toast.warning('Sign-in required to access this data');
            this.auth.getIdToken().catch(()=>{});
          } else if (err.status === 401) {
            this.toast.info('Please sign in to continue');
          }
        }
        return throwError(() => err);
      })
    );
  }
}
