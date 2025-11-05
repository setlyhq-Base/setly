import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Source } from '../../core/models/message.model';

@Component({
  selector: 'app-source-chips',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-wrap gap-1 mt-2">
      <div
        *ngFor="let source of sources.slice(0, 3)"
        class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-white/20 text-white border border-white/30"
        [title]="source.question"
      >
        <span class="truncate max-w-32">{{ source.question }}</span>
      </div>
    </div>
  `,
  styles: []
})
export class SourceChipsComponent {
  @Input() sources: Source[] = [];
}
