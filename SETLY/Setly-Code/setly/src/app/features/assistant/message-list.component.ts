import { Component, Input, ViewChild, ElementRef, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Message, AssistantChip } from '../../core/models/message.model';
import { SourceChipsComponent } from './source-chips.component';

@Component({
  selector: 'app-message-list',
  standalone: true,
  imports: [CommonModule, SourceChipsComponent],
  host: {
    class: 'flex flex-col flex-1 min-h-0' // allow shrink inside flex parent so inner div can scroll
  },
  template: `
    <div
      class="flex-1 overflow-y-auto p-4 space-y-4 h-full min-h-0"
      #messageContainer
      role="log"
      aria-live="polite"
      aria-relevant="additions"
      style="overscroll-behavior-y: contain; -webkit-overflow-scrolling: touch;"
    >
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
          <p class="text-sm whitespace-pre-wrap">{{ formatContent(message.content) }}</p>
          <!-- Interactive chips below assistant messages -->
          <div *ngIf="message.role === 'assistant' && message.chips?.length" class="mt-2 flex flex-wrap gap-2">
            <button
              *ngFor="let c of message.chips"
              class="px-2 py-1 text-xs rounded-full border border-white/40 hover:bg-white/10 transition"
              (click)="onChipClick(c)"
              [attr.data-testid]="'assistant-chip-' + c.key"
              type="button"
            >
              <span *ngIf="c.icon" class="mr-1">{{ c.icon }}</span>{{ c.label }}
            </button>
          </div>
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
export class MessageListComponent implements AfterViewInit, OnChanges {
  @Input() messages: Message[] = [];
  @ViewChild('messageContainer') containerRef!: ElementRef<HTMLDivElement>;
  @Input() chipHandler?: (chip: AssistantChip) => void;

  ngAfterViewInit() { this.scrollToBottom(true); }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['messages']) {
      // Defer to next tick to ensure DOM is updated
      setTimeout(() => this.scrollToBottom(false));
    }
  }

  private scrollToBottom(immediate: boolean) {
    const el = this.containerRef?.nativeElement;
    if (!el) return;
    const behavior: ScrollBehavior = immediate ? 'auto' : 'smooth';
    el.scrollTo({ top: el.scrollHeight, behavior });
  }

  onChipClick(chip: AssistantChip) {
    if (this.chipHandler) {
      this.chipHandler(chip);
    }
  }

  // Strip common Markdown markers so raw ** does not show in replies
  formatContent(text: string): string {
    if (!text) return '';
    let t = text;
    // Bold: **text** -> text
    t = t.replace(/\*\*(.*?)\*\*/g, '$1');
    // Italic: *text* -> text (avoid matching lists by requiring non-space)
    t = t.replace(/(^|\s)\*(\S[^*]*?)\*(?=\s|$)/g, '$1$2');
    // Inline code: `code` -> code
    t = t.replace(/`([^`]+)`/g, '$1');
    // Headings: ### Title -> Title
    t = t.replace(/^#{1,6}\s+/gm, '');
    // Residual stray asterisks
    t = t.replace(/\s\*\s/g, ' ');
    return t;
  }
}
