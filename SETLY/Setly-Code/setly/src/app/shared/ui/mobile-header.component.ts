import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ConversationStoreService } from '../../features/messages/conversation-store.service';

@Component({
  selector: 'app-mobile-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- 🎯 Instagram-Style Sticky Top Bar (Mobile Only) -->
    <div class="instagram-top-bar md:hidden" [class.scrolled]="isScrolled()">
      <div class="top-bar-left">
        <button 
          (click)="onFilterClick()" 
          class="top-bar-action"
          aria-label="Filters">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        </button>
        
        <button 
          (click)="onMapClick()"
          class="top-bar-action"
          aria-label="Map view">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8 2v16M16 6v16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      
      <div class="header-logo-wrapper">
        <a routerLink="/home" class="setly-logo-text">
          <span class="logo-dots">
            <span class="logo-dot logo-dot-1"></span>
            <span class="logo-dot logo-dot-2"></span>
          </span>
          <span class="logo-wordmark">SETLY</span>
        </a>
      </div>
      
      <div class="top-bar-right">
        <button 
          (click)="onSearchClick()" 
          class="top-bar-action"
          aria-label="Search">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
            <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        
        <button 
          (click)="onNotificationClick()" 
          class="top-bar-action notification-btn"
          aria-label="Notifications">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="notification-badge" *ngIf="hasNotifications()">{{ notificationCount() }}</span>
        </button>
        
        <a 
          routerLink="/messages"
          class="top-bar-action"
          aria-label="Messages">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="notification-badge" *ngIf="unreadMessages() > 0">{{ unreadMessages() }}</span>
        </a>
      </div>
    </div>
  `,
  styles: [`
    /* Instagram-style mobile header */
    .instagram-top-bar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 998;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 56px;
      padding: 0 12px;
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border-bottom: 1px solid rgba(226, 232, 240, 0.8);
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .instagram-top-bar.scrolled {
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      border-bottom-color: rgba(226, 232, 240, 1);
    }
    
    .top-bar-left,
    .top-bar-right {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
    }
    
    .top-bar-right {
      justify-content: flex-end;
    }
    
    .header-logo-wrapper {
      flex: 0 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .setly-logo-text {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      text-decoration: none;
      font-size: 18px;
      font-weight: 600;
      letter-spacing: 0.15em;
      color: #1f2937;
      text-transform: uppercase;
      transition: opacity 0.2s ease;
    }
    
    .setly-logo-text:active {
      opacity: 0.7;
    }
    
    .logo-dots {
      position: relative;
      width: 14px;
      height: 18px;
      flex-shrink: 0;
    }
    
    .logo-dot {
      position: absolute;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    }
    
    .logo-dot-1 {
      top: 0;
      right: 0;
    }
    
    .logo-dot-2 {
      bottom: 0;
      left: 0;
    }
    
    .logo-wordmark {
      font-weight: 600;
      letter-spacing: 0.15em;
    }
    
    .top-bar-action {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: transparent;
      border: none;
      color: #374151;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      -webkit-tap-highlight-color: transparent;
      text-decoration: none;
    }
    
    .top-bar-action:active {
      transform: scale(0.92);
      background: rgba(59, 130, 246, 0.08);
    }
    
    .top-bar-action svg {
      transition: color 0.2s ease;
    }
    
    .top-bar-action:hover svg {
      color: #3b82f6;
    }
    
    .notification-badge {
      position: absolute;
      top: 6px;
      right: 6px;
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
      font-size: 10px;
      font-weight: 700;
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4), 0 0 0 2px rgba(255, 255, 255, 0.9);
      animation: badge-pulse 2s ease-in-out infinite;
    }
    
    @keyframes badge-pulse {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.08);
      }
    }
    
    /* Hide on desktop */
    @media (min-width: 768px) {
      .instagram-top-bar {
        display: none;
      }
    }
  `]
})
export class MobileHeaderComponent {
  private router = inject(Router);
  private conversations = inject(ConversationStoreService);
  
  isScrolled = signal(false);
  
  // Notification state (placeholder - connect to real notification service)
  hasNotifications = signal(false);
  notificationCount = signal(0);
  
  // Unread messages count
  unreadMessages = this.conversations.unreadTotal;
  
  constructor() {
    // Listen to scroll events
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', () => {
        this.isScrolled.set(window.scrollY > 10);
      }, { passive: true });
    }
  }
  
  onFilterClick() {
    // Emit event or navigate - implementation depends on page context
    console.log('Filter clicked');
    // You can emit an event here or use a service to communicate with parent
  }
  
  onMapClick() {
    console.log('Map clicked');
    // Navigate to map view or toggle map overlay
  }
  
  onSearchClick() {
    // Open search overlay
    this.router.navigate(['/explore']);
  }
  
  onNotificationClick() {
    console.log('Notifications clicked');
    // Open notifications drawer
  }
}
