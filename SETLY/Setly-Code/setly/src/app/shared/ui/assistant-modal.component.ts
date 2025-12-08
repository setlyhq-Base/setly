import { Component, output, signal, computed, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScrollingModule, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { AssistantService } from '../../features/assistant/assistant.service';
import { RoomPreviewCardComponent } from '../../features/assistant/room-preview-card.component';
import { RideCtaComponent } from '../../features/assistant/ride-cta.component';

@Component({
  selector: 'app-assistant-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ScrollingModule, RoomPreviewCardComponent, RideCtaComponent],
  template: `
    <div class="modal-overlay" (click)="onOverlayClick($event)">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <!-- Header -->
        <header class="modal-header">
          <button class="back-button" (click)="close()" aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <div class="header-content">
            <div class="ai-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 22l-.394-1.433a2.25 2.25 0 00-1.423-1.423L13.25 19l1.433-.394c.614-.168 1.096-.65 1.423-1.423L16.5 15.75l.394 1.433c.328.773.81 1.255 1.423 1.423L19.75 19l-1.433.394c-.614.168-1.095.65-1.423 1.423z" fill="currentColor"/>
              </svg>
            </div>
            <div class="header-text">
              <h1>Setly Assistant</h1>
              <p>Your AI housing & travel guide</p>
            </div>
          </div>
          <button class="new-thread-button" (click)="onNewThread()" aria-label="New conversation">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 4.5v15m7.5-7.5h-15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </header>

        <!-- Messages -->
        <div class="messages-container">
          <cdk-virtual-scroll-viewport 
            #viewport
            [itemSize]="80" 
            class="messages-viewport">
            <div *cdkVirtualFor="let item of items(); trackBy: trackByIndex" class="message-wrapper">
              @if (item.type === 'bot') {
                <div class="message assistant-message">
                  <div class="message-avatar">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" fill="currentColor"/>
                    </svg>
                  </div>
                  <div class="message-content">
                    <div class="message-text" [innerHTML]="item.content"></div>
                    @if (item.chips && item.chips.length > 0) {
                      <div class="chips">
                        @for (chip of item.chips; track chip.label) {
                          <button class="chip" (click)="onChip(chip.key)">{{ chip.label }}</button>
                        }
                      </div>
                    }
                  </div>
                </div>
              }
              @if (item.type === 'user') {
                <div class="message user-message">
                  <div class="message-content">
                    <div class="message-text">{{ item.content }}</div>
                  </div>
                </div>
              }
              @if (item.type === 'room-card') {
                <div class="message assistant-message">
                  <div class="message-avatar">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" fill="currentColor"/>
                    </svg>
                  </div>
                  <div class="message-content">
                    <app-room-preview-card [room]="item.card"></app-room-preview-card>
                  </div>
                </div>
              }
              @if (item.type === 'ride-cta') {
                <div class="message assistant-message">
                  <div class="message-avatar">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" fill="currentColor"/>
                    </svg>
                  </div>
                  <div class="message-content">
                    <app-ride-cta [ride]="item.card"></app-ride-cta>
                  </div>
                </div>
              }
            </div>
          </cdk-virtual-scroll-viewport>
        </div>

        <!-- Input -->
        <div class="input-container">
          <input
            type="text"
            placeholder="Ask anything about housing, rides, or settling in..."
            [(ngModel)]="input"
            (keydown.enter)="send()"
            class="message-input"
            data-testid="assistant-input">
          <button 
            (click)="send()" 
            [disabled]="!input().trim()"
            class="send-button"
            aria-label="Send message">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M6 12h12m0 0l-6-6m6 6l-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      z-index: 1000;
      display: flex;
      align-items: flex-end;
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from { 
        opacity: 0; 
      }
      to { 
        opacity: 1; 
      }
    }

    .modal-container {
      width: 100%;
      max-height: 90vh;
      background: white;
      border-radius: 24px 24px 0 0;
      display: flex;
      flex-direction: column;
      box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.12);
      animation: slideUp 0.25s cubic-bezier(0.32, 0.72, 0, 1);
      will-change: transform;
    }

    @keyframes slideUp {
      from { 
        transform: translateY(100%); 
      }
      to { 
        transform: translateY(0); 
      }
    }

    @media (min-width: 768px) {
      .modal-overlay {
        align-items: center;
        justify-content: center;
      }

      .modal-container {
        width: 600px;
        max-height: 800px;
        border-radius: 24px;
      }
    }

    .modal-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
      border-bottom: 1px solid #E2E8F0;
      background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
    }

    .back-button,
    .new-thread-button {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      border: none;
      background: white;
      color: #64748B;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
      flex-shrink: 0;
    }

    .back-button svg,
    .new-thread-button svg {
      width: 20px;
      height: 20px;
    }

    .back-button:active,
    .new-thread-button:active {
      transform: scale(0.95);
      background: #F1F5F9;
    }

    .header-content {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .ai-icon {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .ai-icon svg {
      width: 20px;
      height: 20px;
    }

    .header-text {
      flex: 1;
      min-width: 0;
    }

    .header-text h1 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #1E293B;
      line-height: 1.3;
    }

    .header-text p {
      margin: 0;
      font-size: 12px;
      color: #64748B;
      line-height: 1.3;
    }

    .messages-container {
      flex: 1;
      overflow: hidden;
      background: #F8FAFC;
    }

    .messages-viewport {
      height: 100%;
      width: 100%;
    }

    .message-wrapper {
      padding: 12px 20px;
    }

    .message {
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }

    .assistant-message .message-avatar {
      width: 32px;
      height: 32px;
      border-radius: 10px;
      background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .assistant-message .message-avatar svg {
      width: 16px;
      height: 16px;
    }

    .message-content {
      flex: 1;
      min-width: 0;
    }

    .assistant-message .message-text {
      background: white;
      padding: 12px 16px;
      border-radius: 16px;
      font-size: 14px;
      line-height: 1.5;
      color: #1E293B;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    }

    .user-message {
      justify-content: flex-end;
    }

    .user-message .message-text {
      background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
      color: white;
      padding: 12px 16px;
      border-radius: 16px;
      font-size: 14px;
      line-height: 1.5;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
    }

    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 12px;
    }

    .chip {
      padding: 8px 16px;
      border-radius: 12px;
      border: 1px solid #E2E8F0;
      background: white;
      color: #3B82F6;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .chip:active {
      transform: scale(0.95);
      background: #F1F5F9;
    }

    .playbooks {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 12px;
    }

    .playbook-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 12px;
      border: 1px solid #E2E8F0;
      background: white;
      cursor: pointer;
      transition: all 0.2s;
      text-align: left;
    }

    .playbook-card:active {
      transform: scale(0.98);
      background: #F8FAFC;
    }

    .playbook-icon {
      font-size: 20px;
      flex-shrink: 0;
    }

    .playbook-title {
      flex: 1;
      font-size: 14px;
      font-weight: 500;
      color: #1E293B;
    }

    .input-container {
      padding: 16px 20px;
      padding-bottom: calc(16px + env(safe-area-inset-bottom, 0));
      background: white;
      border-top: 1px solid #E2E8F0;
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .message-input {
      flex: 1;
      height: 44px;
      padding: 0 16px;
      border-radius: 12px;
      border: 1px solid #E2E8F0;
      background: #F8FAFC;
      font-size: 14px;
      color: #1E293B;
      transition: all 0.2s;
    }

    .message-input:focus {
      outline: none;
      border-color: #3B82F6;
      background: white;
    }

    .message-input::placeholder {
      color: #94A3B8;
    }

    .send-button {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      border: none;
      background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
      flex-shrink: 0;
    }

    .send-button svg {
      width: 20px;
      height: 20px;
    }

    .send-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .send-button:not(:disabled):active {
      transform: scale(0.95);
    }
  `]
})
export class AssistantModalComponent implements AfterViewInit {
  closed = output<void>();
  
  private svc = inject(AssistantService);
  
  input = signal('');
  items = this.svc.messages;
  
  @ViewChild(CdkVirtualScrollViewport) viewport?: CdkVirtualScrollViewport;

  ngAfterViewInit() {
    setTimeout(() => this.scrollToBottom(), 0);
    this.svc.onOpen();
  }

  close() {
    this.svc.onClose();
    this.closed.emit();
  }

  onOverlayClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  send() {
    const val = this.input();
    if (!val.trim()) return;
    this.svc.sendUserMessage(val.trim());
    this.input.set('');
    setTimeout(() => this.scrollToBottom(), 100);
  }

  onChip(key: string) {
    this.svc.handleChip(key);
    setTimeout(() => this.scrollToBottom(), 100);
  }

  onNewThread() {
    this.svc.newThread();
    setTimeout(() => this.scrollToBottom(), 100);
  }

  trackByIndex(index: number) {
    return index;
  }

  private scrollToBottom() {
    try {
      this.viewport?.scrollToIndex(1e9);
    } catch {}
  }
}
