import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RoomStore } from '../../core/state/room.store';

export interface FilterChip {
  id: string;
  label: string;
  icon?: string;
  active: boolean;
}

@Component({
  selector: 'app-filter-chips',
  imports: [CommonModule],
  template: `
    <div class="flex flex-wrap gap-3">
      <button
        *ngFor="let chip of chips"
        (click)="toggleChip(chip.id)"
        [class.active]="chip.active"
  class="chip flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2"
        [class]="chip.active
          ? 'bg-gold/10 text-midnight border-gold'
          : 'bg-white text-gray-700 border-gray-300 hover:border-gold hover:text-midnight'"
        [attr.aria-pressed]="chip.active"
        [attr.aria-label]="chip.label + (chip.active ? ' (active)' : '')"
      >
        <span *ngIf="chip.icon" class="text-sm">{{ chip.icon }}</span>
        <span class="font-medium">{{ chip.label }}</span>
      </button>
    </div>
  `,
  styles: [`
    .chip {
      white-space: nowrap;
    }
  `]
})
export class FilterChipsComponent {
  @Input() chips: FilterChip[] = [];
  @Output() chipToggled = new EventEmitter<string>();

  private roomStore = inject(RoomStore);
  private router = inject(Router);

  toggleChip(chipId: string): void {
    this.chipToggled.emit(chipId);

    // Update room store filters based on chip toggle
    const filterUpdates: any = {};
    switch (chipId) {
      case 'vegetarian':
        filterUpdates.vegetarian = !this.chips.find(c => c.id === chipId)?.active;
        break;
      case 'no-smoking':
        filterUpdates.noSmoking = !this.chips.find(c => c.id === chipId)?.active;
        break;
      case 'pets-ok':
        filterUpdates.petsOk = !this.chips.find(c => c.id === chipId)?.active;
        break;
      case 'private-room':
        filterUpdates.privateRoom = !this.chips.find(c => c.id === chipId)?.active;
        break;
      case 'furnished':
        filterUpdates.furnished = !this.chips.find(c => c.id === chipId)?.active;
        break;
    }

    if (Object.keys(filterUpdates).length > 0) {
      this.roomStore.updateFilters(filterUpdates);
      // Navigate to browse if not already there
      if (this.router.url !== '/browse') {
        this.router.navigate(['/browse']);
      }
    }
  }
}
