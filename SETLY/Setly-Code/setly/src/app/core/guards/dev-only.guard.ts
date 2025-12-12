import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DevOnlyGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const allowed = !environment.production && !!(environment as any)?.featureFlags?.useDummyData;
    if (allowed) return true;

    this.router.navigate(['/']);
    return false;
  }
}
