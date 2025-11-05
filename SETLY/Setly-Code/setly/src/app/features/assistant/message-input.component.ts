import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-4 bg-white">
      <div class="flex space-x-2">
        <textarea
          data-testid="chat-input"
          [(ngModel)]="message"
          (keydown.enter)="onSendMessage()"
          placeholder="Ask me anything about moving to the US..."
          class="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          rows="1"
          [disabled]="isStreaming"
          #textarea
          (input)="adjustHeight(textarea)"
        ></textarea>
        <button
          data-testid="send-btn"
          (click)="onSendMessage()"
          [disabled]="!message.trim() || isStreaming"
          class="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg px-4 py-2 transition-colors"
          aria-label="Send message"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" fill="currentColor"/>
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: []
})
export class MessageInputComponent {
  @Output() sendMessage = new EventEmitter<string>();

  message = '';
  isStreaming = false;

  adjustHeight(textarea: HTMLTextAreaElement) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  onSendMessage() {
    if (this.message.trim() && !this.isStreaming) {
      this.sendMessage.emit(this.message.trim());
      this.message = '';
      this.isStreaming = true;
      // Reset after mock delay
      setTimeout(() => this.isStreaming = false, 2000);
    }
  }
}
