import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { ProfileStore } from '../state/profile.store';

@Injectable({ providedIn: 'root' })
export class TrustedActionGuard implements CanActivate {
  constructor(private profile: ProfileStore, private router: Router) {}
  canActivate(): boolean | UrlTree {
    const pct = this.profile.completion();
    const ver = this.profile.verifications();
    const ok = pct >= 60 && !!(ver?.phoneVerified || ver?.emailVerified);
    if (ok) return true;
    return this.router.parseUrl('/profile/wizard?returnUrl=' + encodeURIComponent(this.router.url));
  }
}
