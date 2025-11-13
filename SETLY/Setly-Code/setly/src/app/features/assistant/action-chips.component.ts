import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ChipItem { key: string; label: string; icon?: string; subtitle?: string; }

@Component({
  selector: 'app-action-chips',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2" data-testid="assistant-action-chips">
      <button *ngFor="let c of chips" (click)="chipClick.emit(c.key)"
        class="text-left rounded-xl border border-gray-200 p-2 bg-white/80 hover:bg-white shadow-sm hover:shadow transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
        [attr.data-testid]="'assistant-chip-' + c.key"
      >
        <div class="flex items-start gap-2">
          <span class="text-lg leading-none" aria-hidden="true">{{c.icon || '⭐'}}</span>
          <div class="leading-tight">
            <div class="text-sm font-medium text-gray-900">{{c.label}}</div>
            <div *ngIf="c.subtitle" class="text-xs text-gray-500">{{c.subtitle}}</div>
          </div>
        </div>
      </button>
    </div>
  `,
  styles: []
})
export class ActionChipsComponent {
  @Input() chips: ChipItem[] = [];
  @Output() chipClick = new EventEmitter<string>();
}
