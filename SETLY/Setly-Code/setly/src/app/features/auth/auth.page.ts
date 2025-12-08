import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SocialButtonsComponent } from './social-buttons.component';
import { AuthService } from '../../core/services/auth.service';
import { AUTH_FLAGS } from '../../../environments/auth.flags';

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
            <h1 class="text-4xl font-bold text-white mb-6">Find Your next Room</h1>
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

          <!-- Error Message -->
          @if (errorMessage()) {
            <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div class="flex items-start">
                <svg class="w-5 h-5 text-red-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                </svg>
                <div class="flex-1">
                  <h3 class="text-sm font-medium text-red-800">Sign-in Error</h3>
                  <p class="mt-1 text-sm text-red-700">{{ errorMessage() }}</p>
                </div>
                <button 
                  (click)="errorMessage.set(null)"
                  class="text-red-400 hover:text-red-600"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                  </svg>
                </button>
              </div>
            </div>
          }

          <!-- Social Buttons -->
          <app-social-buttons
            [loading]="loading()"
            (googleClick)="onGoogleSignIn()"
            (phoneClick)="onPhoneSignIn()"
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
  errorMessage = signal<string | null>(null);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async onGoogleSignIn() {
    // Clear any previous errors
    this.errorMessage.set(null);
    this.loading.set(true);
    
    try {
      console.log('🔐 Starting Google sign-in...');
      await this.authService.signInWithGoogle();
      console.log('✅ Google sign-in successful');
      // Navigation will be handled by auth state changes in the service
      this.router.navigate(['/']);
    } catch (error: any) {
      console.error('❌ Google sign-in error:', error);
      
      // Handle specific error cases
      const errorMsg = error?.message || error?.toString() || 'Unknown error';
      
      if (errorMsg.includes('POPUP_BLOCKED')) {
        this.errorMessage.set('Please allow popups for this site to sign in with Google');
      } else if (errorMsg.includes('cancelled') || errorMsg.includes('closed')) {
        this.errorMessage.set('Sign-in was cancelled');
      } else if (errorMsg.includes('network') || errorMsg.includes('Network')) {
        this.errorMessage.set('Network error. Please check your connection and try again');
      } else if (errorMsg.includes('Firebase not configured')) {
        this.errorMessage.set('Authentication is not configured. Please contact support');
      } else {
        this.errorMessage.set('Failed to sign in with Google. Please try again');
      }
      
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


}
