import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { UserStore } from '../../../core/state/user.store';
import { ProfileStore } from '../../../core/state/profile.store';
import { AuthStore } from '../../../core/state/auth.store';
import { PhoneOtpModalComponent } from '../components/phone-otp.modal';
import { ProfileQuickCaptureModalComponent } from '../../../shared/ui/profile-quick-capture.modal';
import { AuthSyncService } from '../../../core/services/auth-sync.service';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-sign-in-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PhoneOtpModalComponent, ProfileQuickCaptureModalComponent],
  template: `
    <div class="min-h-screen flex flex-col lg:flex-row" data-testid="auth-layout">
      <!-- Brand Panel -->
      <div class="hidden lg:flex lg:w-[45%] flex-col justify-between p-10 bg-blue-500">
        <div>
          <h1 class="text-4xl font-bold text-white max-w-md mb-6" data-testid="brand-headline">
            Find verified homes & rides — where trust meets community.
          </h1>
          <p class="text-indigo-50 max-w-sm">Join a trusted network of students & professionals discovering their next space or ride together.</p>
        </div>
        <div class="text-sm text-white/90 italic" aria-live="polite">{{ testimonial() }}</div>
      </div>

      <!-- Auth Card -->
      <div class="flex-1 flex items-center justify-center px-4 py-10" data-testid="auth-card">
        <div class="w-full max-w-md">
          <div class="mb-8 text-center">
            <h2 class="text-2xl font-semibold mb-2" data-testid="auth-title">Sign in to Setly</h2>
            <p class="text-gray-500">Welcome back</p>
          </div>

          <div class="space-y-3 mb-6">
            <!-- Email/Password Login Form -->
            <div *ngIf="showEmailLogin()" class="space-y-3">
              <input 
                type="email" 
                [(ngModel)]="email" 
                placeholder="Email" 
                class="w-full h-12 px-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                [disabled]="loading()"
              />
              <div class="relative">
                <input 
                  [type]="showPassword() ? 'text' : 'password'"
                  [(ngModel)]="password" 
                  placeholder="Password" 
                  class="w-full h-12 px-4 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  [disabled]="loading()"
                  (keyup.enter)="signInWithEmail()"
                />
                <button 
                  type="button"
                  (click)="showPassword.set(!showPassword())"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  <svg *ngIf="!showPassword()" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                  <svg *ngIf="showPassword()" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                  </svg>
                </button>
              </div>
              <button 
                type="button" 
                (click)="signInWithEmail()" 
                [disabled]="loading() || !email || !password"
                class="provider-btn bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
              >
                Sign In
                <span *ngIf="loadingProvider() === 'email'" class="spinner"></span>
              </button>
              <button 
                type="button"
                (click)="showEmailLogin.set(false)"
                class="w-full text-sm text-gray-600 hover:text-gray-800"
              >
                ← Back to social login
              </button>
            </div>

            <!-- Social Login Buttons -->
            <div *ngIf="!showEmailLogin()" class="space-y-3">
              <button type="button" data-testid="btn-email" aria-label="Sign in with Email" (click)="showEmailLogin.set(true)" [disabled]="loading()" class="provider-btn bg-blue-500 text-white hover:bg-blue-600">
                <span class="provider-icon email"></span> Sign in with Email
              </button>
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
          </div>

          <p class="sr-only" aria-hidden="true">or</p>
          <!-- Hidden future divider -->
          <div class="hidden text-center text-sm text-gray-400 mb-6">or use your verified organization email</div>

            <div class="flex items-center justify-between text-sm text-gray-600 mb-4">
              <a routerLink="/auth/sign-up" class="text-indigo-600 hover:underline">Don’t have an account? Sign Up</a>
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

          <!-- Quick Capture Modal: only when name missing after auth -->
          <app-profile-quick-capture-modal
            *ngIf="quickCaptureOpen()"
            [email]="prefilledEmail() || authStore.user().email || userStore.user()?.primaryEmail"
            (saved)="onQuickSaved()"
            (cancelled)="onQuickCancelled()"
          />
        </div>
      </div>
    </div>
  `,
  styles: [`
  .provider-btn { @apply w-full h-12 rounded-xl font-medium flex items-center justify-center gap-3 relative transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60; }
    .provider-icon { @apply inline-block w-5 h-5; }
  /* Use root-relative paths so Angular resolves from /src/assets */
  .provider-icon.email { background: url('/assets/email.svg') center/contain no-repeat; }
  .provider-icon.google { background: url('/assets/google.svg') center/contain no-repeat; }
  .provider-icon.microsoft { background: url('/assets/microsoft.svg') center/contain no-repeat; }
  .provider-icon.facebook { background: url('/assets/facebook.svg') center/contain no-repeat; }
  .provider-icon.phone { background: url('/assets/phone.svg') center/contain no-repeat; }
    .spinner { @apply absolute right-4 w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin; }
  `]
})
export class SignInPage {
  loading = signal(false);
  loadingProvider = signal<string | null>(null);
  phoneModalOpen = signal(false);
  quickCaptureOpen = signal(false);
  prefilledEmail = signal<string | undefined>(undefined);
  toastMessage = signal('');
  toastType = signal<'error' | 'success' | ''>('');
  testimonial = signal('"Great matches and super fast!" – Beta User');
  showEmailLogin = signal(false);
  showPassword = signal(false);
  email = '';
  password = '';
  private testimonialIdx = 0;
  private testimonials = [
    '"Great matches and super fast!" – Beta User',
    '"I found a trusted roommate in 2 days." – Priya',
    '"The phone verification feels safe." – David'
  ];

  private sync = inject(AuthSyncService);
  private http = inject(HttpClient);
  
  constructor(private auth: AuthService, private router: Router, private analytics: AnalyticsService, public userStore: UserStore, private profileStore: ProfileStore, private route: ActivatedRoute, public authStore: AuthStore) {
    this.rotateTestimonials();
    this.analytics.fire('auth_viewed', { page: 'sign-in' });
    // Ensure sync is initialized so profile is hydrated post-login
    this.sync.init();
  }

  async signInWithEmail(): Promise<void> {
    if (!this.email || !this.password) {
      this.toast('Please enter both email and password', 'error');
      return;
    }

    this.analytics.fire('auth_provider_click', { provider: 'email' });
    this.loading.set(true);
    this.loadingProvider.set('email');

    try {
      const apiUrl = environment.apiUrl || 'https://api.setly.in';
      const response = await this.http.post<{user: any, token: string}>(`${apiUrl}/auth/login`, {
        email: this.email,
        password: this.password
      }).toPromise();

      if (response?.token) {
        // Store JWT token
        localStorage.setItem('setly_auth_token', response.token);
        
        // Store user data in auth store
        this.authStore.setUser({
          userId: response.user.userId,
          email: response.user.email,
          displayName: response.user.name,
          photoURL: response.user.photoUrl,
          isNew: false
        });

        // Update user store
        await this.userStore.refresh();

        this.toast('Signed in successfully', 'success');
        this.analytics.fire('auth_success', { provider: 'email', isNew: false });

        // Navigate to next or home
        const next = this.route.snapshot.queryParamMap.get('next');
        setTimeout(() => {
          if (next) this.router.navigateByUrl(next);
          else this.router.navigate(['/']);
        }, 500);
      }
    } catch (err: any) {
      console.error('Email login error:', err);
      this.analytics.fire('auth_failed', { provider: 'email', reason: err?.error?.error || err?.message });
      
      const errorMessage = err?.error?.error || err?.message || 'Login failed';
      if (errorMessage.includes('Invalid email or password')) {
        this.toast('Invalid email or password', 'error');
      } else if (errorMessage.includes('social login')) {
        this.toast('This account uses social login. Please sign in with Google, Microsoft, or Facebook.', 'error');
      } else {
        this.toast(errorMessage, 'error');
      }
    } finally {
      this.loading.set(false);
      this.loadingProvider.set(null);
    }
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
      .then(async () => {
        this.toast('Signed in', 'success');
        this.analytics.fire('auth_success', { provider: name, isNew: false });
        // Wait briefly for AuthSyncService to hydrate the profile
        // Wait for profile hydration and legacy user store (double source) to reduce false 'new user' detection
  const profile = await this.waitForProfile(800);
        // After profile attempt, ensure userStore has attempted a refresh in case auth-sync ran before store subscription
        if (!this.userStore.user()) {
          try { await this.userStore.refresh(); } catch {}
        }
        const next = this.route.snapshot.queryParamMap.get('next');
        // Prefer email from AuthStore (hydrated immediately by AuthSyncService). Fallback to UserStore if available.
        const email = this.authStore.user().email || (this.userStore.user() as any)?.primaryEmail;
        // Determine if we need quick capture:
        // - First-time login flagged by backend (isNew)
        // - Missing name across likely sources
        // - Missing basic profile context (location and university)
        // - Very low completion (<30)
        const nameSources = [
          (profile?.displayName || '').trim(),
          (this.userStore.user()?.name || '').trim(),
          (this.authStore.user().displayName || '').trim(),
        ];
        const hasName = nameSources.some(n => !!n);
        const missingBasics = !profile || (!((profile.location || '').trim()) && !((profile.university || '').trim()));
        const lowCompletion = (this.profileStore.completion() as any) < 30; // computed signal -> number
        const forceNew = !!this.authStore.user().isNew;
        // Suppress quick capture briefly after a successful save to avoid re-prompting due to slow backend
        const SUPPRESS_MS = 24 * 60 * 60 * 1000; // 24h
        let suppressed = false;
        try {
          const uid = this.authStore.user().userId || 'me';
          const ts = parseInt(localStorage.getItem(`qc.completed.${uid}`) || '0', 10);
          suppressed = !!ts && (Date.now() - ts) < SUPPRESS_MS;
        } catch {}
        const needsQuickCapture = (forceNew || !hasName || missingBasics || lowCompletion) && !suppressed;
        if (needsQuickCapture) {
          // Show inline quick capture and defer navigation
          this.prefilledEmail.set(email || undefined);
          this.quickCaptureOpen.set(true);
        } else {
          // Friendly welcome toast
          const shownName = (profile?.displayName || this.userStore.user()?.name || this.authStore.user().displayName || 'there');
          const first = (shownName).split(' ')[0];
          window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'success', message: `Welcome back, ${first}!` } }));
          if (next) this.router.navigateByUrl(next); else this.router.navigate(['/']);
        }
      })
      .catch(err => {
        console.error(err);
        this.analytics.fire('auth_failed', { provider: name, reason: err?.code || err?.message });
        
        // Handle popup blocker specifically
        const errorMessage = err?.message || '';
        if (errorMessage.includes('POPUP_BLOCKED')) {
          this.toast('Please allow popups for Setly and try again', 'error');
        } else if (errorMessage === 'Sign-in cancelled') {
          this.toast('Sign-in was cancelled', 'error');
        } else {
          this.toast(this.humanError(err?.code), 'error');
        }
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
    this.analytics.fire('auth_success', { provider: 'phone', isNew: false });
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
      'auth/popup-blocked': 'Your browser blocked the sign-in window. We\'ll try again with a full-page redirect.',
      'auth/operation-not-supported-in-this-environment': 'This browser blocks popups. Redirecting to Google sign-in…',
      'auth/cookie-not-supported': 'Cookies are disabled. Redirecting to complete sign-in…',
      'auth/unauthorized-domain': 'Sign-in is not enabled for this domain. Please contact support.',
      'auth/account-exists-with-different-credential': 'Account exists with different provider. Try that one.',
      'default': 'Sign in failed. Please try again.'
    };
    return map[code] || map['default'];
  }

  private async waitForProfile(timeoutMs = 800) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const p = this.profileStore.profile();
      if (p) return p;
      await new Promise(r => setTimeout(r, 100));
    }
    return this.profileStore.profile();
  }

  onQuickSaved() {
    this.quickCaptureOpen.set(false);
    const next = this.route.snapshot.queryParamMap.get('next');
    if (next) this.router.navigateByUrl(next); else this.router.navigate(['/']);
  }

  onQuickCancelled() {
    this.quickCaptureOpen.set(false);
    const next = this.route.snapshot.queryParamMap.get('next');
    if (next) this.router.navigateByUrl(next); else this.router.navigate(['/']);
  }
}
