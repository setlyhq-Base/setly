import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ConversationStoreService } from './conversation-store.service';

@Component({
  selector: 'app-messages-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <main class="min-h-screen bg-gray-50 py-8" data-testid="messages-page">
      <div class="max-w-4xl mx-auto px-4">
        <h1 class="text-3xl font-bold mb-8">Messages</h1>

        <!-- Messages interface -->
        <div class="bg-white rounded-lg shadow-sm overflow-hidden">
          <!-- Conversations List -->
          <div class="border-b border-gray-200 p-4">
            <h2 class="text-lg font-semibold mb-3">Conversations</h2>
            <div class="flex gap-2 overflow-x-auto pb-1">
              <button *ngFor="let c of conversations" (click)="select(c.id)" class="px-3 py-1 rounded-md border text-sm whitespace-nowrap" [class.btn-brand]="activeId===c.id">
                {{ c.label }}
              </button>
              <div *ngIf="!conversations.length" class="text-gray-500 text-sm py-1">No conversations yet</div>
            </div>
          </div>

          <!-- Message input area -->
          <div class="p-4">
            <!-- Active conversation context -->
            <div *ngIf="active() as conv" class="mb-3 text-sm text-gray-600">
              Chatting with <span class="font-medium">{{ conv.label }}</span>
              <span *ngIf="conv.market" class="ml-1 text-gray-500">• Listing {{ conv.market }}</span>
            </div>
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
            <!-- Recent messages (mock) -->
            <div *ngIf="active() as conv2" class="mt-4 space-y-2">
              <div *ngFor="let m of conv2.messages" class="text-sm"><span class="text-gray-500">You:</span> {{ m }}</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  `
})
export class MessagesPage implements OnInit {
  private route = inject(ActivatedRoute);
  private store = inject(ConversationStoreService);
  messageText = '';
  get conversations(){ return this.store.conversations(); }
  get activeId(){ return this.store['activeId'](); }

  ngOnInit(): void {
    // Prefill message from query param if provided
    const qp = this.route.snapshot.queryParamMap;
    const text = qp.get('text');
    const withId = qp.get('with') || undefined;
    const market = qp.get('market') || undefined;
    if (withId) this.ensureConversation(withId, market);
    if (text) this.messageText = text;
  }

  sendMessage(): void {
    if (this.messageText.trim()) {
      const conv = this.active();
      if (conv) this.store.addMessage(conv.id, this.messageText.trim());
      console.log('Sending message:', this.messageText);
      this.messageText = '';
    }
  }

  ensureConversation(withId: string, market?: string) {
    this.store.ensure(withId, withId, market);
  }
  select(id: string){ this.store.setActive(id); }
  active(){ return this.store.active(); }
}
