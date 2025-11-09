import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PhoneOtpModalComponent } from '../components/phone-otp.modal';
import { AnalyticsService } from '../../../core/services/analytics.service';

@Component({
  selector: 'app-sign-up-page',
  standalone: true,
  imports: [CommonModule, RouterLink, PhoneOtpModalComponent],
  template: `
    <div class="min-h-screen flex flex-col lg:flex-row" data-testid="auth-layout">
      <!-- Brand Panel -->
      <div class="hidden lg:flex lg:w-[45%] flex-col justify-between p-10 bg-gradient-to-br from-indigo-600 via-indigo-500/70 to-white">
        <div>
          <h1 class="text-4xl font-bold text-white max-w-md mb-6" data-testid="brand-headline">
            Find verified homes & rides — where trust meets community.
          </h1>
          <p class="text-indigo-50 max-w-sm">Create your Setly account and join a trusted network.</p>
        </div>
        <div class="text-sm text-white/90 italic" aria-live="polite">{{ testimonial() }}</div>
      </div>

      <!-- Auth Card -->
      <div class="flex-1 flex items-center justify-center px-4 py-10" data-testid="auth-card">
        <div class="w-full max-w-md">
          <div class="mb-8 text-center">
            <h2 class="text-2xl font-semibold mb-2" data-testid="auth-title">Create your Setly account</h2>
            <p class="text-gray-500">It only takes a minute</p>
          </div>

          <div class="space-y-3 mb-6">
            <button type="button" data-testid="btn-google" aria-label="Continue with Google" (click)="provider('google')" [disabled]="loading()" class="provider-btn bg-white border border-gray-300 text-gray-800">
              <span class="provider-icon google"></span> Continue with Google
              <span *ngIf="loadingProvider() === 'google'" class="spinner"></span>
            </button>
            <button type="button" data-testid="btn-microsoft" aria-label="Continue with Microsoft" (click)="provider('microsoft')" [disabled]="loading()" class="provider-btn bg-white border border-gray-300 text-gray-800">
              <span class="provider-icon microsoft"></span> Continue with Microsoft
              <span *ngIf="loadingProvider() === 'microsoft'" class="spinner"></span>
            </button>
            <button type="button" data-testid="btn-facebook" aria-label="Continue with Facebook" (click)="provider('facebook')" [disabled]="loading()" class="provider-btn bg-[#1877F2] text-white">
              <span class="provider-icon facebook"></span> Continue with Facebook
              <span *ngIf="loadingProvider() === 'facebook'" class="spinner"></span>
            </button>
            <button type="button" data-testid="btn-phone" aria-label="Continue with Phone number" (click)="openPhoneModal()" [disabled]="loading()" class="provider-btn bg-white border border-gray-300 text-gray-800">
              <span class="provider-icon phone"></span> Continue with Phone number
            </button>
          </div>

          <div class="flex items-center justify-between text-sm text-gray-600 mb-4">
            <a routerLink="/auth/sign-in" class="text-indigo-600 hover:underline">Already have an account? Sign In</a>
            <span class="hidden"><a href="#" class="text-indigo-600 hover:underline">Forgot password?</a></span>
          </div>

          <p class="text-xs text-gray-500 text-center leading-relaxed">
            By continuing, you agree to Setly’s <a routerLink="/terms" class="underline">Terms</a> and <a routerLink="/privacy" class="underline">Privacy Policy</a>.
          </p>

          <div *ngIf="toastMessage()" data-testid="auth-toast" class="mt-4 p-3 rounded-lg text-sm" [class.bg-red-50]="toastType()==='error'" [class.text-red-700]="toastType()==='error'" [class.bg-green-50]="toastType()==='success'" [class.text-green-700]="toastType()==='success'">
            {{ toastMessage() }}
          </div>

          <app-phone-otp-modal
            [open]="phoneModalOpen()"
            (closed)="phoneModalOpen.set(false)"
            (success)="onPhoneSuccess()"
            (failure)="onPhoneFailure($event)"
          />
        </div>
      </div>
    </div>
    <div id="recaptcha-container" class="hidden"></div>
  `,
  styles: [`
    .provider-btn { @apply w-full h-12 rounded-xl font-medium flex items-center justify-center gap-3 relative transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60; }
    .provider-icon { @apply inline-block w-5 h-5; }
  /* Use root-relative paths so Angular resolves from /src/assets */
  .provider-icon.google { background: url('/assets/google.svg') center/contain no-repeat; }
  .provider-icon.microsoft { background: url('/assets/microsoft.svg') center/contain no-repeat; }
  .provider-icon.facebook { background: url('/assets/facebook.svg') center/contain no-repeat; }
  .provider-icon.phone { background: url('/assets/phone.svg') center/contain no-repeat; }
    .spinner { @apply absolute right-4 w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin; }
  `]
})
export class SignUpPage {
  loading = signal(false);
  loadingProvider = signal<string | null>(null);
  phoneModalOpen = signal(false);
  toastMessage = signal('');
  toastType = signal<'error' | 'success' | ''>('');
  testimonial = signal('“Quality listings and verified users.” – Aditi');
  private testimonialIdx = 0;
  private testimonials = [
    '“Quality listings and verified users.” – Aditi',
    '“Loved the simple signup!” – Ronak',
    '“Phone OTP was quick.” – Sara'
  ];

  constructor(private auth: AuthService, private router: Router, private analytics: AnalyticsService) {
    this.rotateTestimonials();
    this.analytics.fire('auth_viewed', { page: 'sign-up' });
  }

  provider(name: 'google' | 'microsoft' | 'facebook'): void {
    this.analytics.fire('auth_provider_click', { provider: name });
    this.loading.set(true);
    this.loadingProvider.set(name);
    const action = {
      google: () => this.auth.signInWithGoogle(),
      microsoft: () => this.auth.signInWithMicrosoft(),
      facebook: () => this.auth.signInWithFacebook()
    }[name];
    action()
      .then(() => {
        this.toast('Welcome to Setly', 'success');
        this.analytics.fire('auth_success', { provider: name, isNew: true });
        this.router.navigate(['/profile/wizard']);
      })
      .catch(err => {
        console.error(err);
        this.analytics.fire('auth_failed', { provider: name, reason: err?.code || err?.message });
        this.toast(this.humanError(err?.code), 'error');
      })
      .finally(() => {
        this.loading.set(false);
        this.loadingProvider.set(null);
      });
  }

  openPhoneModal(): void {
    this.analytics.fire('auth_provider_click', { provider: 'phone' });
    this.phoneModalOpen.set(true);
  }

  onPhoneSuccess(): void {
    this.analytics.fire('auth_success', { provider: 'phone', isNew: true });
    this.toast('Phone verified', 'success');
    this.router.navigate(['/profile/wizard']);
  }

  onPhoneFailure(reason: string): void {
    this.analytics.fire('auth_failed', { provider: 'phone', reason });
    this.toast(reason, 'error');
  }

  private toast(msg: string, type: 'error' | 'success'): void {
    this.toastMessage.set(msg);
    this.toastType.set(type);
    setTimeout(() => this.toastMessage.set(''), 4000);
  }

  private rotateTestimonials(): void {
    setInterval(() => {
      this.testimonialIdx = (this.testimonialIdx + 1) % this.testimonials.length;
      this.testimonial.set(this.testimonials[this.testimonialIdx]);
    }, 5000);
  }

  private humanError(code: string): string {
    const map: Record<string, string> = {
      'auth/popup-closed-by-user': 'Closed before completing. Try again.',
      'auth/account-exists-with-different-credential': 'Account exists with different provider. Try that one.',
      'default': 'Sign up failed. Please try again.'
    };
    return map[code] || map['default'];
  }
}
