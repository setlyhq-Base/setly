import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { CurrentUserService } from '../user/current-user.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileGuard implements CanActivate {
  constructor(
    private currentUser: CurrentUserService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.currentUser.isAuthenticated() && this.currentUser.isProfileComplete()) {
      return true;
    }

    // If authenticated but profile incomplete, redirect to profile completion
    if (this.currentUser.isAuthenticated()) {
      this.router.navigate(['/auth/profile']);
      return false;
    }

    // If not authenticated, redirect to auth
    this.router.navigate(['/auth'], {
      queryParams: { next: this.router.url }
    });
    return false;
  }
}
