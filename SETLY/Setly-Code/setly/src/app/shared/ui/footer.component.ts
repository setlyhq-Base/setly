import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
    <footer class="bg-gray-50 border-t border-gray-200 px-4 py-8" data-testid="site-footer">
      <div class="max-w-7xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div class="flex items-center space-x-2 mb-4">
              <span class="northstar"></span>
              <span class="text-gray-900 font-bold text-lg">SETLY</span>
            </div>
            <p class="text-gray-600 text-sm">
              Setly - Find Your next Room near your university with roommates who match your lifestyle.
            </p>
          </div>

          <div>
            <h3 class="text-gray-900 font-semibold mb-4">Company</h3>
            <ul class="space-y-2 text-sm">
              <li><a href="/about" class="text-gray-600 hover:text-gray-900 transition-colors" aria-label="About Setly">About</a></li>
              <li><a href="/careers" class="text-gray-600 hover:text-gray-900 transition-colors" aria-label="Careers at Setly">Careers</a></li>
              <li><a href="/blog" class="text-gray-600 hover:text-gray-900 transition-colors" aria-label="Setly blog">Blog</a></li>
              <li><a href="/safety" class="text-gray-600 hover:text-gray-900 transition-colors" aria-label="Safety information">Safety</a></li>
              <li><a href="/help" class="text-gray-600 hover:text-gray-900 transition-colors" aria-label="Help center">Help</a></li>
            </ul>
          </div>

          <div>
            <h3 class="text-gray-900 font-semibold mb-4">Support</h3>
            <ul class="space-y-2 text-sm">
              <li><a href="/terms" class="text-gray-600 hover:text-gray-900 transition-colors" aria-label="Terms of service">Terms</a></li>
              <li><a href="/privacy" class="text-gray-600 hover:text-gray-900 transition-colors" aria-label="Privacy policy">Privacy</a></li>
              <li><a href="mailto:support@setly.com" class="text-gray-600 hover:text-gray-900 transition-colors" aria-label="Contact support">Contact</a></li>
            </ul>
          </div>

          <div>
            <h3 class="text-gray-900 font-semibold mb-4">Connect</h3>
            <ul class="space-y-2 text-sm">
              <li><a href="https://facebook.com/setly" target="_blank" rel="noopener" class="text-gray-600 hover:text-gray-900 transition-colors" aria-label="Follow us on Facebook" data-testid="social-facebook">Facebook</a></li>
              <li><a href="https://twitter.com/setly" target="_blank" rel="noopener" class="text-gray-600 hover:text-gray-900 transition-colors" aria-label="Follow us on Twitter" data-testid="social-twitter">Twitter</a></li>
              <li><a href="https://instagram.com/setly" target="_blank" rel="noopener" class="text-gray-600 hover:text-gray-900 transition-colors" aria-label="Follow us on Instagram" data-testid="social-instagram">Instagram</a></li>
              <li><a href="https://linkedin.com/company/setly" target="_blank" rel="noopener" class="text-gray-600 hover:text-gray-900 transition-colors" aria-label="Follow us on LinkedIn" data-testid="social-linkedin">LinkedIn</a></li>
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
