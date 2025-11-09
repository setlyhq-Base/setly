import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { CurrentUserService } from '../user/current-user.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private currentUser: CurrentUserService,
    private router: Router
  ) {}

  canActivate(): boolean {
    // Soft disable allows navigation without auth
    if (environment.featureFlags?.softDisableAuth) {
      return true;
    }

    if (this.currentUser.isAuthenticated()) {
      return true;
    }

    // Redirect to auth with return URL
    this.router.navigate(['/auth/sign-in'], {
      queryParams: { next: this.router.url }
    });
    return false;
  }
}
