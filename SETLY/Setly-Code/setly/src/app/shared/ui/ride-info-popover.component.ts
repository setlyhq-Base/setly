import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ride-info-popover',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      data-testid="ride-info"
      type="button"
      class="inline-flex items-center text-gray-400 hover:text-gray-600 focus:text-gray-600 transition-colors"
      [attr.aria-label]="'What is SettlyRide?'"
      (click)="togglePopover()"
      (keydown.enter)="togglePopover()"
      (keydown.space)="$event.preventDefault(); togglePopover()"
      (keydown.escape)="closePopover()"
    >
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
      </svg>
    </button>

    <div
      data-testid="ride-info-popover"
      class="absolute z-50 w-80 p-4 bg-white border border-gray-200 rounded-lg shadow-lg"
      [class.opacity-0]="!isOpen"
      [class.pointer-events-none]="!isOpen"
      [class.opacity-100]="isOpen"
      [class.pointer-events-auto]="isOpen"
      role="tooltip"
      [attr.aria-hidden]="!isOpen"
    >
      <div class="space-y-3">
        <h3 class="font-semibold text-gray-900">What is SettlyRide?</h3>
        <p class="text-sm text-gray-600">
          SettlyRide helps you coordinate rides with peers you know (classmates, colleagues, community). It's not a transportation company and doesn't process payments. Any ride is strictly between participants. Follow local laws and campus rules, use good judgment, and share your trip with someone you trust. In emergencies, call 911.
        </p>
        <p class="text-xs text-gray-500 italic">
          Not for hire: Setly does not arrange rides or accept payment. This is a peer coordination tool only.
        </p>
        <a
          routerLink="/terms/settlyride"
          class="inline-block text-sm text-indigo-600 hover:text-indigo-800 underline"
        >
          Learn more
        </a>
      </div>
    </div>
  `,
  styles: [`
    :host {
      position: relative;
    }
  `]
})
export class RideInfoPopoverComponent {
  @Input() isOpen = false;

  togglePopover(): void {
    this.isOpen = !this.isOpen;
  }

  closePopover(): void {
    this.isOpen = false;
  }
}
