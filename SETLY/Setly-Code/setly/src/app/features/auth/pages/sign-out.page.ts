import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sign-out-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-[60vh] flex items-center justify-center px-4">
      <div class="w-full max-w-md text-center">
        <div class="mx-auto mb-6 w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-2xl">⎋</div>
        <h1 class="text-2xl font-semibold mb-2">You have been signed out</h1>
        <p class="text-gray-600 mb-6">Thanks for using Setly. You can sign back in anytime.</p>
        <div class="flex items-center justify-center gap-3">
          <a routerLink="/" class="px-4 py-2 rounded-lg border border-gray-200">Go Home</a>
          <a routerLink="/auth/sign-in" class="px-4 py-2 rounded-lg text-white" style="background:linear-gradient(90deg,var(--gradient-start),var(--gradient-end));">Sign in</a>
        </div>
      </div>
    </div>
  `
})
export class SignOutPage {
  private auth = inject(AuthService);
  private router = inject(Router);

  async ngOnInit() {
    try {
      await this.auth.signOut();
    } catch {}
    // Optional: auto-redirect to sign-in after a short delay
    setTimeout(() => {
      // Preserve a 'next' param to return to home after sign-in
      const next = '/';
      this.router.navigate(['/auth/sign-in'], { queryParams: { next } });
    }, 2000);
  }
}
