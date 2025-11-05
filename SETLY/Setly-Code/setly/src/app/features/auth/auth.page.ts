import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SocialButtonsComponent } from './social-buttons.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [CommonModule, SocialButtonsComponent],
  template: `
    <div class="min-h-screen bg-gray-900 flex">
      <!-- Left side - Brand/Benefits -->
      <div class="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-8 xl:px-12 bg-gradient-to-br from-indigo-600 to-purple-700">
        <div class="mx-auto w-full max-w-md">
          <div class="text-center">
            <div class="flex items-center justify-center space-x-2 mb-8">
              <span class="northstar"></span>
              <span class="text-3xl font-bold text-white">SETLY</span>
            </div>
            <h1 class="text-4xl font-bold text-white mb-6">Find Your Perfect Room</h1>
            <p class="text-xl text-indigo-100 mb-8">Connect with verified students and professionals in your area</p>
            <div class="space-y-4 text-left">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span class="text-white font-bold">✓</span>
                </div>
                <span class="text-white">Verified student and professional communities</span>
              </div>
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span class="text-white font-bold">✓</span>
                </div>
                <span class="text-white">Safe and secure peer-to-peer connections</span>
              </div>
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span class="text-white font-bold">✓</span>
                </div>
                <span class="text-white">University and company email verification</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right side - Auth Card -->
      <div class="flex-1 flex flex-col justify-center px-6 py-12 lg:px-8 xl:px-12">
        <div class="mx-auto w-full max-w-md">
          <div class="lg:hidden text-center mb-8">
            <div class="flex items-center justify-center space-x-2 mb-4">
              <span class="northstar"></span>
              <span class="text-2xl font-bold text-white">SETLY</span>
            </div>
          </div>

          <!-- Social Buttons -->
          <app-social-buttons
            [loading]="loading()"
            (googleClick)="onGoogleSignIn()"
            (facebookClick)="onFacebookSignIn()"
            (phoneClick)="onPhoneSignIn()"
            class="mb-8"
          />

          <!-- Terms -->
          <p class="text-center text-sm text-gray-500">
            By continuing, you agree to Setly
            <a href="/terms" class="text-indigo-600 hover:text-indigo-500">Terms & Privacy</a>
          </p>

          <!-- Hidden reCAPTCHA container -->
          <div id="recaptcha-container"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .northstar {
      @apply inline-block w-4 h-4 rounded-full bg-white align-middle;
    }
  `]
})
export class AuthPage {
  loading = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async onGoogleSignIn() {
    this.loading.set(true);
    try {
      await this.authService.signInWithGoogle();
      // Navigation will be handled by auth state changes
    } catch (error) {
      console.error('Google sign-in error:', error);
      this.loading.set(false);
    }
  }

  async onFacebookSignIn() {
    this.loading.set(true);
    try {
      await this.authService.signInWithFacebook();
      // Navigation will be handled by auth state changes
    } catch (error) {
      console.error('Facebook sign-in error:', error);
      this.loading.set(false);
    }
  }

  async onPhoneSignIn() {
    this.loading.set(true);
    try {
      await this.authService.initializeRecaptcha();
      // Navigate to phone verification page
      this.router.navigate(['/auth/phone']);
    } catch (error) {
      console.error('Phone sign-in initialization error:', error);
      this.loading.set(false);
    }
  }

  async onEmailSignIn(email: string, password: string) {
    this.loading.set(true);
    try {
      await this.authService.signIn(email, password);
      // Navigation will be handled by auth state changes
    } catch (error) {
      console.error('Email sign-in error:', error);
      this.loading.set(false);
    }
  }

  async onEmailSignUp(email: string, password: string) {
    this.loading.set(true);
    try {
      await this.authService.signUp(email, password);
      // Navigation will be handled by auth state changes
    } catch (error) {
      console.error('Email sign-up error:', error);
      this.loading.set(false);
    }
  }

  async onMagicLinkSignIn(email: string) {
    this.loading.set(true);
    try {
      await this.authService.sendSignInLinkToEmail(email);
      // Show success message
      this.loading.set(false);
    } catch (error) {
      console.error('Magic link error:', error);
      this.loading.set(false);
    }
  }
}
