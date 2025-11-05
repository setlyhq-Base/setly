import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Message } from '../../core/models/message.model';
import { SourceChipsComponent } from './source-chips.component';

@Component({
  selector: 'app-message-list',
  standalone: true,
  imports: [CommonModule, SourceChipsComponent],
  template: `
    <div class="flex-1 overflow-y-auto p-4 space-y-4" #messageContainer>
      <div
        *ngFor="let message of messages"
        class="flex"
        [class]="message.role === 'user' ? 'justify-end' : 'justify-start'"
      >
        <div
          class="max-w-[80%] rounded-2xl px-4 py-2 shadow-sm"
          [class]="message.role === 'user'
            ? 'bg-gray-100 text-gray-900'
            : 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white'"
        >
          <p class="text-sm whitespace-pre-wrap">{{ message.content }}</p>
          <app-source-chips
            *ngIf="message.sources && message.sources.length > 0"
            [sources]="message.sources"
            class="mt-2"
          ></app-source-chips>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class MessageListComponent {
  @Input() messages: Message[] = [];

  ngAfterViewChecked() {
    // Auto-scroll to bottom
    const container = document.querySelector('.overflow-y-auto') as HTMLElement;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }
}
