import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { CurrentUserService } from '../user/current-user.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProfileGuard implements CanActivate {
  constructor(
    private currentUser: CurrentUserService,
    private router: Router
  ) {}

  canActivate(): boolean {
    // Soft disable bypasses guard logic entirely
    if (environment.featureFlags?.softDisableAuth) {
      return true;
    }

    const authed = this.currentUser.isAuthenticated();
    const profileComplete = this.currentUser.isProfileComplete();

    if (authed && profileComplete) {
      return true;
    }

    if (authed && !profileComplete) {
      this.router.navigate(['/profile/wizard'], { queryParams: { next: this.router.url } });
      return false;
    }

    // Not authed
    this.router.navigate(['/auth/sign-in'], { queryParams: { next: this.router.url } });
    return false;
  }
}
