import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-social-buttons',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-8 right-8 flex flex-col space-y-4 z-50">
      <!-- Google Button -->
      <button
        type="button"
        (click)="googleClick.emit()"
        [disabled]="loading()"
        class="w-16 h-16 bg-white rounded-full shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center group"
        title="Continue with Google"
      >
        <svg class="w-8 h-8" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        @if (loading()) {
          <div class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-full">
            <div class="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        }
      </button>

      <!-- Phone Button -->
      <button
        type="button"
        (click)="phoneClick.emit()"
        [disabled]="loading()"
        class="w-16 h-16 bg-indigo-600 rounded-full shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center group"
        title="Continue with Phone"
        data-testid="btn-phone"
      >
        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
        </svg>
        @if (loading()) {
          <div class="absolute inset-0 flex items-center justify-center bg-indigo-600 bg-opacity-75 rounded-full">
            <div class="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        }
      </button>
    </div>
  `,
  styles: [`
    .group:hover svg {
      transform: scale(1.1);
    }
  `]
})
export class SocialButtonsComponent {
  loading = input<boolean>(false);

  googleClick = output<void>();
  phoneClick = output<void>();
}
