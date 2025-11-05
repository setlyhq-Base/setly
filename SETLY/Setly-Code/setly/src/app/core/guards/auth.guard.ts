import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { CurrentUserService } from '../user/current-user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private currentUser: CurrentUserService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.currentUser.isAuthenticated()) {
      return true;
    }

    // Redirect to auth with return URL
    this.router.navigate(['/auth'], {
      queryParams: { next: this.router.url }
    });
    return false;
  }
}
