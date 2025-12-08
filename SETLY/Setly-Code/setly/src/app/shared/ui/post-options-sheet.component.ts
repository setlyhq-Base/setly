import { Component, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export interface PostOption {
  id: 'room' | 'ride' | 'market';
  title: string;
  description: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-post-options-sheet',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sheet-overlay" (click)="closeSheet()">
      <div class="sheet-content" (click)="$event.stopPropagation()">
        <!-- Handle bar for iOS-style sheet -->
        <div class="sheet-handle"></div>
        
        <!-- Header -->
        <div class="sheet-header">
          <h2 class="sheet-title">Create Post</h2>
          <p class="sheet-subtitle">What would you like to post?</p>
        </div>
        
        <!-- Post options -->
        <div class="options-container">
          <button 
            *ngFor="let option of postOptions()"
            class="option-card"
            (click)="selectOption(option)"
            [attr.data-testid]="'post-option-' + option.id">
            <div class="option-icon" [innerHTML]="option.icon"></div>
            <div class="option-content">
              <h3 class="option-title">{{ option.title }}</h3>
              <p class="option-description">{{ option.description }}</p>
            </div>
            <svg class="option-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        
        <!-- Cancel button -->
        <button class="cancel-button" (click)="closeSheet()">
          Cancel
        </button>
      </div>
    </div>
  `,
  styles: [`
    /* Sheet overlay */
    .sheet-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
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
    
    /* Sheet content */
    .sheet-content {
      background: white;
      border-radius: 20px 20px 0 0;
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      padding: 24px 20px;
      padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px));
      box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.12);
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
    
    /* iOS-style handle bar */
    .sheet-handle {
      width: 40px;
      height: 4px;
      background: #D1D5DB;
      border-radius: 2px;
      margin: 0 auto 20px;
    }
    
    /* Header */
    .sheet-header {
      text-align: center;
      margin-bottom: 24px;
    }
    
    .sheet-title {
      font-size: 22px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 8px 0;
      letter-spacing: -0.02em;
    }
    
    .sheet-subtitle {
      font-size: 14px;
      color: #6B7280;
      margin: 0;
    }
    
    /* Options container */
    .options-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 20px;
    }
    
    /* Option card */
    .option-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: #F9FAFB;
      border: 1.5px solid #E5E7EB;
      border-radius: 16px;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      text-align: left;
      width: 100%;
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
    }
    
    .option-card:active {
      transform: scale(0.97);
      background: #F3F4F6;
      border-color: #3B82F6;
    }
    
    /* Option icon */
    .option-icon {
      width: 48px;
      height: 48px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }
    
    .option-icon :deep(svg) {
      width: 28px;
      height: 28px;
    }
    
    /* Option content */
    .option-content {
      flex: 1;
      min-width: 0;
    }
    
    .option-title {
      font-size: 16px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 4px 0;
      letter-spacing: -0.01em;
    }
    
    .option-description {
      font-size: 13px;
      color: #6B7280;
      margin: 0;
      line-height: 1.4;
    }
    
    /* Option arrow */
    .option-arrow {
      flex-shrink: 0;
      color: #9CA3AF;
      transition: transform 0.2s ease, color 0.2s ease;
    }
    
    .option-card:active .option-arrow {
      transform: translateX(4px);
      color: #3B82F6;
    }
    
    /* Cancel button */
    .cancel-button {
      width: 100%;
      padding: 16px;
      background: white;
      border: 2px solid #E5E7EB;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      color: #6B7280;
      cursor: pointer;
      transition: all 0.2s ease;
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
    }
    
    .cancel-button:active {
      transform: scale(0.97);
      background: #F9FAFB;
      border-color: #D1D5DB;
    }
    
    /* Responsive adjustments */
    @media (min-width: 640px) {
      .sheet-content {
        border-radius: 20px;
        margin: 20px auto;
      }
    }
  `]
})
export class PostOptionsSheetComponent {
  closed = output<void>();
  optionSelected = output<PostOption>();
  
  postOptions = signal<PostOption[]>([
    {
      id: 'room',
      title: 'Post a Room',
      description: 'List a shared or private room near your campus',
      icon: `<svg viewBox="0 0 24 24" fill="none"><path d="M3 10l9-7 9 7" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 21v-6h4v6" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      route: '/post-room'
    },
    {
      id: 'ride',
      title: 'Post a Ride',
      description: 'Offer rides or request a seat from other students',
      icon: `<svg viewBox="0 0 24 24" fill="none"><path d="M5 17h14M5 17c-1.1 0-2-.9-2-2v-4c0-.55.45-1 1-1l2.5-4c.3-.48.84-.8 1.44-.8h7.12c.6 0 1.14.32 1.44.8L19 10c.55 0 1 .45 1 1v4c0 1.1-.9 2-2 2M5 17v1M19 17v1" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="7.5" cy="17" r="1.5" fill="#10B981"/><circle cx="16.5" cy="17" r="1.5" fill="#10B981"/></svg>`,
      route: '/ride'
    },
    {
      id: 'market',
      title: 'Sell an Item',
      description: 'List books, furniture, electronics, and more',
      icon: `<svg viewBox="0 0 24 24" fill="none"><path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" stroke="#F59E0B" stroke-width="2" stroke-linejoin="round"/><path d="M12 13V3" stroke="#F59E0B" stroke-width="2" stroke-linejoin="round"/><path d="M3 8l9 5 9-5" stroke="#F59E0B" stroke-width="2" stroke-linejoin="round"/></svg>`,
      route: '/browse'
    }
  ]);
  
  constructor(private router: Router) {}
  
  selectOption(option: PostOption) {
    this.optionSelected.emit(option);
    this.router.navigate([option.route]);
    this.closeSheet();
  }
  
  closeSheet() {
    this.closed.emit();
  }
}
