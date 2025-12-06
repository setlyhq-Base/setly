import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { ProfileStore } from '../state/profile.store';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TrustedActionGuard implements CanActivate {
  constructor(private profile: ProfileStore, private router: Router) {}
  canActivate(): boolean | UrlTree {
    if (environment.featureFlags?.bypassTrustedActions) {
      return true;
    }
    const pct = this.profile.completion();
    const ver = this.profile.verifications();
    if (ver == null) {
      return true;
    }
    const ok = pct >= 60 && !!(ver.phoneVerified || ver.emailVerified);
    if (ok) return true;
    return this.router.parseUrl('/profile/wizard?returnUrl=' + encodeURIComponent(this.router.url));
  }
}
