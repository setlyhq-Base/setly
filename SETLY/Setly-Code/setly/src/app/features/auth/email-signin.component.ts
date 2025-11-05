import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-email-signin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <div class="text-center">
        <h2 class="text-2xl font-bold text-white mb-2">{{ isSignUp() ? 'Create Account' : 'Sign In' }}</h2>
        <p class="text-gray-400">{{ isSignUp() ? 'Join the Setly community' : 'Welcome back' }}</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
        @if (isSignUp()) {
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">First Name</label>
              <input
                type="text"
                formControlName="firstName"
                class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="John"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
              <input
                type="text"
                formControlName="lastName"
                class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Doe"
              >
            </div>
          </div>
        }

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Email</label>
          <input
            type="email"
            formControlName="email"
            class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="your@email.com"
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Password</label>
          <input
            type="password"
            formControlName="password"
            class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="••••••••"
          >
        </div>

        @if (isSignUp()) {
          <div class="flex items-center">
            <input
              id="terms"
              type="checkbox"
              formControlName="termsAccepted"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            >
            <label for="terms" class="ml-2 block text-sm text-gray-300">
              I agree to the <a href="#" class="text-indigo-400 hover:text-indigo-300">Terms of Service</a> and <a href="#" class="text-indigo-400 hover:text-indigo-300">Privacy Policy</a>
            </label>
          </div>
        }

        <button
          type="submit"
          [disabled]="loading() || form.invalid"
          class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:cursor-not-allowed"
        >
          @if (loading()) {
            <div class="flex items-center justify-center">
              <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              {{ isSignUp() ? 'Creating Account...' : 'Signing In...' }}
            </div>
          } @else {
            {{ isSignUp() ? 'Create Account' : 'Sign In' }}
          }
        </button>
      </form>

      <div class="text-center">
        <button
          type="button"
          (click)="toggleMode()"
          class="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
        >
          {{ isSignUp() ? 'Already have an account? Sign in' : "Don't have an account? Sign up" }}
        </button>
      </div>

      @if (!isSignUp()) {
        <div class="text-center">
          <button
            type="button"
            (click)="sendMagicLink()"
            [disabled]="loading()"
            class="text-gray-400 hover:text-gray-300 text-sm"
          >
            Or sign in with magic link
          </button>
        </div>
      }
    </div>
  `
})
export class EmailSigninComponent {
  isSignUp = signal(false);
  loading = signal(false);
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      firstName: [''],
      lastName: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      termsAccepted: [false]
    });

    if (this.isSignUp()) {
      this.form.get('firstName')?.setValidators([Validators.required]);
      this.form.get('lastName')?.setValidators([Validators.required]);
      this.form.get('termsAccepted')?.setValidators([Validators.requiredTrue]);
    }
  }

  toggleMode() {
    this.isSignUp.set(!this.isSignUp());
    if (this.isSignUp()) {
      this.form.get('firstName')?.setValidators([Validators.required]);
      this.form.get('lastName')?.setValidators([Validators.required]);
      this.form.get('termsAccepted')?.setValidators([Validators.requiredTrue]);
    } else {
      this.form.get('firstName')?.clearValidators();
      this.form.get('lastName')?.clearValidators();
      this.form.get('termsAccepted')?.clearValidators();
    }
    this.form.get('firstName')?.updateValueAndValidity();
    this.form.get('lastName')?.updateValueAndValidity();
    this.form.get('termsAccepted')?.updateValueAndValidity();
  }

  async onSubmit() {
    if (this.form.invalid) return;

    this.loading.set(true);
    try {
      const { email, password } = this.form.value;

      if (this.isSignUp()) {
        await this.authService.signUp(email, password);
        // After signup, redirect to profile completion
        this.router.navigate(['/auth/profile']);
      } else {
        await this.authService.signIn(email, password);
        // After signin, check if profile is complete
        if (this.authService.currentUser()?.isProfileComplete) {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/auth/profile']);
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      // Handle error (show toast, etc.)
    } finally {
      this.loading.set(false);
    }
  }

  async sendMagicLink() {
    const email = this.form.get('email')?.value;
    if (!email) return;

    this.loading.set(true);
    try {
      await this.authService.sendSignInLinkToEmail(email);
      // Show success message
      alert('Magic link sent! Check your email.');
    } catch (error) {
      console.error('Magic link error:', error);
    } finally {
      this.loading.set(false);
    }
  }
}
