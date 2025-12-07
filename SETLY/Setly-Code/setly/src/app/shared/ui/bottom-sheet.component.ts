import { Component, input, output, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bottom-sheet',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Backdrop -->
    @if (isOpen()) {
      <div 
        class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90] backdrop-enter"
        (click)="close()"
        [@fadeIn]>
      </div>
    }
    
    <!-- Bottom Sheet -->
    <div 
      class="bottom-sheet"
      [class.active]="isOpen()"
      role="dialog"
      [attr.aria-label]="title()"
      [attr.aria-hidden]="!isOpen()">
      
      <!-- Handle -->
      <div class="bottom-sheet-handle"></div>
      
      <!-- Header -->
      <div class="px-6 pb-4 border-b border-gray-100">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-bold text-gray-900">{{ title() }}</h2>
          <button 
            (click)="close()"
            class="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
            aria-label="Close">
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Content -->
      <div class="overflow-y-auto max-h-[calc(85vh-80px)] px-6 py-4">
        <ng-content></ng-content>
      </div>
      
      <!-- Footer (optional) -->
      @if (showFooter()) {
        <div class="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <ng-content select="[footer]"></ng-content>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: contents;
    }
  `]
})
export class BottomSheetComponent {
  isOpen = input<boolean>(false);
  title = input<string>('');
  showFooter = input<boolean>(false);
  
  closed = output<void>();
  
  constructor() {
    // Lock body scroll when open
    effect(() => {
      if (this.isOpen()) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });
  }
  
  close() {
    this.closed.emit();
  }
}
