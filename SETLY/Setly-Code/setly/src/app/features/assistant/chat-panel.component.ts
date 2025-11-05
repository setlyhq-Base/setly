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
        <button
          data-testid="close-chat"
          (click)="close.emit()"
          class="text-white hover:text-gray-200 transition-colors"
          aria-label="Close chat"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
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
        class="flex-1"
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

    // Mock streaming response
    this.assistantService.query(message).subscribe(result => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.response,
        timestamp: new Date(),
        sources: result.sources
      };
      this.assistantService.addMessage(assistantMessage);
    });
  }
}
