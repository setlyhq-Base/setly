import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-sign-up-page',
  imports: [RouterOutlet],
  template: `
    <main class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div class="max-w-md w-full">
        <div class="bg-white rounded-lg shadow-sm p-8">
          <div class="text-center mb-8">
            <div class="flex items-center justify-center space-x-2 mb-4">
              <span class="northstar"></span>
              <span class="text-2xl font-bold">SETLY</span>
            </div>
          </div>

          <!-- Step content will be rendered here -->
          <router-outlet></router-outlet>
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
export class SignUpPage {}
