import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InterestChip } from '../../../core/models/profile.model';
import { DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-interests-grid',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  template: `
    <section class="card">
      <div class="card-header">
        <h2 class="card-title">My Interests</h2>
        <button class="btn-primary rounded-full px-4 py-2 text-sm" (click)="showSuggestions = !showSuggestions">+ Add Interests</button>
      </div>
      <div class="flex flex-wrap gap-3 mb-4" cdkDropList (cdkDropListDropped)="reorder($event)">
        <button
          *ngFor="let chip of chips; let i = index"
          cdkDrag
          (click)="toggle(chip.key)"
          class="interest-chip"
          [class.active]="selected.includes(chip.key)"
        >
          <span class="mr-1">{{ chip.icon }}</span>{{ chip.label }}
        </button>
        <div *ngIf="!chips.length" class="text-gray-500">No interests configured.</div>
      </div>
      <div *ngIf="showSuggestions" class="mt-2 p-3 rounded-xl bg-indigo-50/60 border border-indigo-200 space-y-2">
        <div class="text-xs font-medium text-indigo-700">Suggestions</div>
        <div class="flex flex-wrap gap-2">
          <button *ngFor="let s of suggestionPool" (click)="addSuggestion(s)" class="suggestion">{{ s.label }}</button>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .card { @apply bg-white rounded-2xl shadow-sm border border-gray-200 p-6; }
    .card-header { @apply flex items-center justify-between mb-4; }
  .card-title { @apply text-lg font-semibold; }
  .interest-chip { @apply px-4 py-2 rounded-full text-sm bg-gray-100 text-gray-700 hover:shadow-md active:scale-[.97] transition select-none cursor-pointer; position:relative; }
    .interest-chip.active { background:#5A4FF3; color:#fff; box-shadow:0 4px 12px -2px rgba(90,79,243,0.45); }
    .suggestion { @apply text-xs px-3 py-1 rounded-full bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-600 hover:text-white transition; }
  `]
})
export class InterestsGridComponent {
  @Input() chips: InterestChip[] = [];
  @Input() selected: string[] = [];
  @Output() selectedChange = new EventEmitter<string[]>();

  showSuggestions = false;
  suggestionPool: InterestChip[] = [
    { key: 'hiking', label: 'Hiking', icon: '🥾' },
    { key: 'reading', label: 'Reading', icon: '📚' },
    { key: 'culinary', label: 'Cooking', icon: '🍳' },
    { key: 'tech', label: 'Tech Startups', icon: '💡' },
    { key: 'art', label: 'Art & Museums', icon: '🖼️' },
  ];

  toggle(key: string) {
    if (this.selected.includes(key)) {
      this.selected = this.selected.filter(k => k !== key);
    } else {
      this.selected = [...this.selected, key];
    }
    this.selectedChange.emit(this.selected);
  }

  addSuggestion(chip: InterestChip) {
    if (!this.chips.find(c => c.key === chip.key)) {
      this.chips = [...this.chips, chip];
    }
    if (!this.selected.includes(chip.key)) {
      this.selected = [...this.selected, chip.key];
      this.selectedChange.emit(this.selected);
    }
  }

  reorder(event: any) {
    const prev = [...this.chips];
    const item = prev.splice(event.previousIndex, 1)[0];
    prev.splice(event.currentIndex, 0, item);
    this.chips = prev;
  }
}
