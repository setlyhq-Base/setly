import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageListComponent } from './message-list.component';
import { MessageInputComponent } from './message-input.component';
import { NorthStarIconComponent } from '../../shared/ui/north-star-icon.component';
import { AssistantService } from '../../core/services/assistant.service';
import { Message } from '../../core/models/message.model';

@Component({
  selector: 'app-chat-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, MessageListComponent, MessageInputComponent, NorthStarIconComponent],
  template: `
    <div class="w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
      <!-- Header -->
      <div data-testid="assistant-header" class="bg-indigo-600 text-white p-4 flex items-center justify-between rounded-t-2xl">
        <div class="flex items-center space-x-2">
          <app-north-star-icon></app-north-star-icon>
          <h2 class="font-semibold">Setly Assistant</h2>
        </div>
        <div class="flex items-center space-x-2">
          <button
            data-testid="clear-chat"
            (click)="onClearChat()"
            class="text-white hover:text-gray-200 transition-colors"
            aria-label="Clear chat"
            title="Clear chat"
            type="button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m-1 14a2 2 0 01-2 2H9a2 2 0 01-2-2V8h10v12z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <button
            data-testid="close-chat"
            (click)="close.emit()"
            class="text-white hover:text-gray-200 transition-colors"
            aria-label="Close chat"
            type="button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Quick Starts -->
      <div class="p-4 bg-gray-50 border-b">
        <div class="flex flex-wrap gap-2">
          <button
            *ngFor="let chip of quickStarts"
            data-testid="quick-start"
            (click)="sendQuickStart(chip)"
            class="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm hover:bg-indigo-200 transition-colors"
          >
            {{ chip }}
          </button>
        </div>
      </div>

      <!-- Messages -->
      <app-message-list
        [messages]="messages"
        [chipHandler]="onChipClick.bind(this)"
        class="flex-1 min-h-0"
      ></app-message-list>

      <!-- Input -->
      <app-message-input
        (sendMessage)="onSendMessage($event)"
        class="border-t"
      ></app-message-input>
    </div>
  `,
  styles: []
})
export class ChatPanelComponent implements OnInit, OnDestroy {
  @Output() close = new EventEmitter<void>();

  messages: Message[] = [];
  quickStarts = ['Find housing', 'Airport pickup', 'Documents for SSN', 'Open a bank account', 'Get a US SIM'];
  private subscription: any;

  constructor(private assistantService: AssistantService) {}

  ngOnInit() {
    // Ensure a friendly welcome appears once per session
    this.assistantService.seedWelcomeMessage();
    this.subscription = this.assistantService.messages$.subscribe(messages => {
      this.messages = messages;
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  sendQuickStart(chip: string) {
    this.onSendMessage(chip);
  }

  onSendMessage(message: string) {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };
  this.assistantService.addMessage(userMessage);
  // Gamify tick per user message
  this.assistantService.gamifyTick();

    // Mock streaming response
    this.assistantService.query(message, this.messages).subscribe(result => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.response,
        chips: result.chips,
        timestamp: new Date(),
        sources: result.sources
      };
      this.assistantService.addMessage(assistantMessage);
    });
  }

  onChipClick(chip: { key: string; label: string }) {
    if (chip.key === 'start-over') {
      this.onClearChat();
      this.assistantService.seedWelcomeMessage();
      return;
    }
    if (chip.key === 'next-steps') {
      this.onSendMessage('What are my next steps?');
      return;
    }
    if (chip.key === 'resources') {
      this.onSendMessage('Share helpful resources for my topic.');
      return;
    }
  }

  onClearChat() {
    this.assistantService.clearMessages();
    this.messages = [];
    // Optionally show a fresh welcome again
    setTimeout(() => this.assistantService.seedWelcomeMessage(), 0);
  }
}
