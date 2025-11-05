import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NorthStarIconComponent } from '../../shared/ui/north-star-icon.component';
import { ChatPanelComponent } from './chat-panel.component';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, NorthStarIconComponent, ChatPanelComponent],
  host: { 'style': 'pointer-events: auto' },
  template: `
    <button
      data-testid="chat-fab"
      (click)="openPanel()"
      class="fixed bottom-4 right-4 z-[9999] rounded-full p-4 bg-indigo-600 text-white shadow-lg
             transition-opacity duration-200
             opacity-100 pointer-events-auto"
      [class.opacity-0]="!isFabVisible"
      [class.pointer-events-none]="!isFabVisible"
      aria-label="Open Setly Assistant"
    >
      <app-north-star-icon class="w-6 h-6"></app-north-star-icon>
      <span *ngIf="unreadCount > 0" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{{ unreadCount }}</span>
    </button>

    <section
      data-testid="chat-panel"
      class="fixed bottom-24 right-4 z-[9999] w-[min(92vw,380px)] max-h-[80vh]
             rounded-2xl bg-white text-gray-900 shadow-2xl overflow-hidden border border-gray-200
             transition-all duration-250
             opacity-0 translate-y-4 pointer-events-none"
      [class.opacity-100]="isOpen"
      [class.translate-y-0]="isOpen"
      [class.pointer-events-auto]="isOpen"
      role="dialog" aria-modal="true" aria-label="Setly Assistant"
    >
      <app-chat-panel
        (close)="closePanel()"
      ></app-chat-panel>
    </section>
  `,
  styles: []
})
export class ChatWidgetComponent implements OnInit {
  isOpen = false;
  isFabVisible = true;
  unreadCount = 0;

  ngOnInit() {
    // Analytics
    console.log('Assistant event: assistant_opened');
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({ event: 'assistant_opened' });
    }
  }

  openPanel() {
    this.isOpen = true;
    this.isFabVisible = false;
    this.unreadCount = 0;
    // Analytics
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({ event: 'assistant_opened' });
    }
  }

  closePanel() {
    this.isOpen = false;
    this.isFabVisible = true;
  }
}
