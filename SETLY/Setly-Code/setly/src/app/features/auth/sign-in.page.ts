import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sign-in-page',
  template: `
    <main class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div class="max-w-md w-full">
        <div class="bg-white rounded-lg shadow-sm p-8">
          <div class="text-center mb-8">
            <div class="flex items-center justify-center space-x-2 mb-4">
              <span class="northstar"></span>
              <span class="text-2xl font-bold">SETLY</span>
            </div>
            <h1 class="text-xl font-semibold text-gray-900">Sign In</h1>
            <p class="text-gray-600">Sign in to your account</p>
          </div>

          <!-- Sign in form -->
          <form class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                placeholder="your@email.com"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                placeholder="••••••••"
              >
            </div>

            <button type="submit" class="btn w-full bg-brand-primary hover:bg-brand-primary/90 text-white py-3 rounded-lg font-semibold">
              Sign In
            </button>

            <button type="button" class="w-full text-brand-primary hover:text-brand-primary/80 font-medium py-2">
              Or sign in with magic link
            </button>
          </form>

          <div class="mt-6 text-center">
            <p class="text-gray-600">
              Don't have an account?
              <a routerLink="/auth/sign-up" class="text-brand-primary hover:text-brand-primary/80 font-medium">Create account</a>
            </p>
          </div>
        </div>
      </div>
    </main>
  `,
  styles: [`
    .northstar {
      @apply inline-block w-3 h-3 rounded-full bg-brand-primary align-middle;
    }
  `]
})
export class SignInPage {}
