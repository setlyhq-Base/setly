import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-messages-page',
  imports: [FormsModule],
  template: `
    <main class="min-h-screen bg-gray-50 py-8" data-testid="messages-page">
      <div class="max-w-4xl mx-auto px-4">
        <h1 class="text-3xl font-bold mb-8">Messages</h1>

        <!-- Messages interface -->
        <div class="bg-white rounded-lg shadow-sm overflow-hidden">
          <!-- Conversations List -->
          <div class="border-b border-gray-200 p-4">
            <h2 class="text-lg font-semibold mb-4">Conversations</h2>
            <div class="space-y-2">
              <!-- Empty state -->
              <div class="text-center py-8" data-testid="empty-state">
                <p class="text-gray-500">No conversations yet</p>
              </div>
            </div>
          </div>

          <!-- Message input area -->
          <div class="p-4">
            <div class="flex space-x-4">
              <textarea
                placeholder="Type a message"
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                [(ngModel)]="messageText"
                (keydown.enter)="sendMessage()"
                rows="1"
              ></textarea>
              <button
                (click)="sendMessage()"
                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                [disabled]="!messageText.trim()"
                aria-label="Send message"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  `
})
export class MessagesPage {
  messageText = '';

  sendMessage(): void {
    if (this.messageText.trim()) {
      console.log('Sending message:', this.messageText);
      this.messageText = '';
    }
  }
}
