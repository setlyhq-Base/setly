import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
    <footer class="bg-gray-50 border-t border-gray-200 px-4 py-8">
      <div class="max-w-7xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div class="flex items-center space-x-2 mb-4">
              <span class="northstar"></span>
              <span class="text-gray-900 font-bold text-lg">SETLY</span>
            </div>
            <p class="text-gray-600 text-sm">
              Find your next room near your university with roommates who match your lifestyle.
            </p>
          </div>

          <div>
            <h3 class="text-gray-900 font-semibold mb-4">Company</h3>
            <ul class="space-y-2 text-sm">
              <li><a href="#" class="text-gray-600 hover:text-gray-900 transition-colors">About</a></li>
              <li><a href="#" class="text-gray-600 hover:text-gray-900 transition-colors">Safety</a></li>
              <li><a href="#" class="text-gray-600 hover:text-gray-900 transition-colors">Help</a></li>
            </ul>
          </div>

          <div>
            <h3 class="text-gray-900 font-semibold mb-4">Support</h3>
            <ul class="space-y-2 text-sm">
              <li><a href="#" class="text-gray-600 hover:text-gray-900 transition-colors">Terms</a></li>
              <li><a href="#" class="text-gray-600 hover:text-gray-900 transition-colors">Privacy</a></li>
              <li><a href="#" class="text-gray-600 hover:text-gray-900 transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h3 class="text-gray-900 font-semibold mb-4">Connect</h3>
            <ul class="space-y-2 text-sm">
              <li><a href="#" class="text-gray-600 hover:text-gray-900 transition-colors">Facebook</a></li>
              <li><a href="#" class="text-gray-600 hover:text-gray-900 transition-colors">Twitter</a></li>
              <li><a href="#" class="text-gray-600 hover:text-gray-900 transition-colors">Instagram</a></li>
            </ul>
          </div>
        </div>

        <div class="border-t border-gray-200 mt-8 pt-8 text-center text-gray-600 text-sm">
          <p>&copy; {{ currentYear }} Setly. All rights reserved.</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .northstar {
      @apply inline-block w-2.5 h-2.5 rounded-full bg-brand-blue align-middle;
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
