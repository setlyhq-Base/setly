import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-section-title',
  imports: [CommonModule],
  template: `
    <div class="text-center mb-12">
      <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        {{ title }}
      </h2>
      <p *ngIf="subtitle" class="text-lg text-gray-600 max-w-2xl mx-auto">
        {{ subtitle }}
      </p>
    </div>
  `
})
export class SectionTitleComponent {
  @Input({ required: true }) title!: string;
  @Input() subtitle?: string;
}
