import { Component, signal, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ConversationStoreService } from '../../features/messages/conversation-store.service';
import { PostOptionsSheetComponent } from './post-options-sheet.component';
import { ProfileMenuSheetComponent } from './profile-menu-sheet.component';
import { AssistantModalComponent } from './assistant-modal.component';
import { AuthStore } from '../../core/state/auth.store';
import { UserStore } from '../../core/state/user.store';

interface NavItem {
  label: string;
  icon?: string;
  route?: string;
  action?: 'post-sheet';
  badge?: number;
  isProfile?: boolean;
}

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, PostOptionsSheetComponent, ProfileMenuSheetComponent, AssistantModalComponent],
  template: `
    <nav class="bottom-nav" aria-label="Mobile navigation">
      <div class="bottom-nav-container">
        @for (item of navItemsWithBadge(); track item.label) {
          <!-- Regular navigation items with route -->
          <a 
            *ngIf="item.route && !item.isProfile"
            [routerLink]="item.route"
            routerLinkActive="active"
            class="nav-item"
            [attr.aria-label]="item.label"
            [attr.data-testid]="'nav-' + item.label.toLowerCase()">
            <span class="nav-icon">
              @if (item.label === 'Connect') {
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              }
              @if (item.label === 'Explore') {
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M6 6h.008v.008H6V6z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              }
              @if (item.label === 'Messages') {
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              }
            </span>
            <span class="nav-label">{{ item.label }}</span>
            @if (item.badge && item.badge > 0) {
              <span class="nav-badge">{{ item.badge > 9 ? '9+' : item.badge }}</span>
            }
          </a>
          
          <!-- Profile item with user avatar -->
          <button 
            *ngIf="item.isProfile"
            (click)="openProfileMenu()"
            class="nav-item profile-item"
            [class.active]="showProfileMenu()"
            [attr.aria-label]="item.label"
            [attr.data-testid]="'nav-' + item.label.toLowerCase()">
            <div class="nav-avatar-wrapper">
              <img 
                [src]="userAvatarUrl()" 
                [alt]="item.label"
                class="nav-avatar"
                (error)="onAvatarError($event)">
            </div>
            <span class="nav-label">{{ item.label }}</span>
          </button>
          
          <!-- Post action button (opens sheet) -->
          <button
            *ngIf="item.action === 'post-sheet'"
            (click)="openPostSheet()"
            class="nav-item post-item"
            [class.active]="showPostSheet()"
            [attr.aria-label]="item.label"
            [attr.data-testid]="'nav-' + item.label.toLowerCase()">
            <span class="nav-icon post-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 4.5v15m7.5-7.5h-15" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
          </button>
        }
      </div>
    </nav>
    
    <!-- Post options sheet -->
    <app-post-options-sheet
      *ngIf="showPostSheet()"
      (closed)="closePostSheet()"
      (optionSelected)="closePostSheet()">
    </app-post-options-sheet>
    
    <!-- Profile menu sheet -->
    <app-profile-menu-sheet
      *ngIf="showProfileMenu()"
      (closed)="closeProfileMenu()"
      (assistantRequested)="openAssistant()">
    </app-profile-menu-sheet>
    
    <!-- Assistant modal -->
    <app-assistant-modal
      *ngIf="showAssistantModal()"
      (closed)="closeAssistant()">
    </app-assistant-modal>
  `,
  styles: [`
    /* Mobile-first bottom navigation - iOS/Android style */
    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 999;
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border-top: 1px solid rgba(226, 232, 240, 0.8);
      padding-bottom: env(safe-area-inset-bottom, 0);
      box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.06), 0 -1px 3px rgba(0, 0, 0, 0.04);
      display: block;
      pointer-events: auto;
    }
    
    @media (min-width: 768px) {
      .bottom-nav {
        display: none;
      }
    }
    
    .bottom-nav-container {
      display: flex;
      justify-content: space-around;
      align-items: center;
      height: 64px;
      max-width: 100%;
      margin: 0 auto;
      padding: 8px 4px;
      gap: 2px;
    }
    
    .nav-item {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 8px 12px;
      min-width: 56px;
      min-height: 56px;
      flex: 1;
      text-decoration: none;
      color: #6B7280;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      -webkit-tap-highlight-color: transparent;
      border-radius: 12px;
      user-select: none;
      touch-action: manipulation;
      cursor: pointer;
      pointer-events: auto;
      background: transparent;
      border: none;
      font-family: inherit;
    }
    
    .nav-item:active {
      transform: scale(0.90);
      background: rgba(59, 130, 246, 0.08);
    }
    
    .nav-item.active {
      color: #3b82f6;
      background: rgba(59, 130, 246, 0.06);
    }
    
    .nav-item.active::before {
      content: '';
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 32px;
      height: 3px;
      background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
      border-radius: 0 0 3px 3px;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
    }
    
    .nav-item.active .nav-icon {
      transform: translateY(-2px);
      filter: drop-shadow(0 2px 6px rgba(59, 130, 246, 0.3));
    }
    
    .nav-icon {
      width: 24px;
      height: 24px;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      justify-content: center;
      color: inherit;
    }
    
    .nav-icon svg {
      width: 100%;
      height: 100%;
      stroke: currentColor;
      fill: none;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
      display: block;
    }
    
    .nav-item.active .nav-icon svg {
      stroke-width: 2.5;
    }
    
    .nav-label {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.02em;
      line-height: 1.2;
      text-align: center;
      transition: all 0.2s ease;
    }
    
    .nav-item.active .nav-label {
      font-weight: 700;
      transform: translateY(-1px);
    }
    
    /* Profile avatar styles */
    .nav-avatar-wrapper {
      position: relative;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      overflow: hidden;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .nav-avatar {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
    }
    
    .profile-item.active .nav-avatar-wrapper {
      box-shadow: 0 0 0 2.5px #3b82f6, 0 2px 8px rgba(59, 130, 246, 0.4);
      transform: translateY(-2px);
    }
    
    .profile-item .nav-avatar-wrapper {
      box-shadow: 0 0 0 2px rgba(226, 232, 240, 0.8);
    }
    
    /* Post button (center) - Clean + icon only */
    .post-item {
      position: relative;
    }
    
    .post-item .post-icon {
      width: 28px;
      height: 28px;
    }
    
    .post-item .post-icon svg {
      width: 100%;
      height: 100%;
      stroke: currentColor;
      fill: none;
      stroke-width: 2.5;
      stroke-linecap: round;
      stroke-linejoin: round;
      display: block;
    }
    
    .post-item.active .post-icon {
      color: #3b82f6;
    }
    
    /* Remove label from Post button */
    .post-item .nav-label {
      display: none;
    }
    
    .nav-badge {
      position: absolute;
      top: 8px;
      right: 8px;
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
    
    /* Smooth transitions for all elements */
    * {
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
  `]
})
export class BottomNavComponent {
  private conversations = inject(ConversationStoreService);
  private authStore = inject(AuthStore);
  private userStore = inject(UserStore);
  
  // State for post options sheet
  showPostSheet = signal(false);
  
  // State for profile menu sheet
  showProfileMenu = signal(false);
  
  // State for assistant modal
  showAssistantModal = signal(false);
  
  // User avatar URL with fallback
  userAvatarUrl = computed(() => {
    return this.authStore.user().avatarUrl || 
           this.userStore.user()?.photoUrl || 
           '/default-avatar.svg';
  });
  
  // Maximum 5 tabs for best mobile UX - following iOS/Android standards
  navItems = signal<NavItem[]>([
    {
      label: 'Connect',
      icon: `<svg viewBox="0 0 24 24" fill="none"><path d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      route: '/connect'
    },
    {
      label: 'Home',
      icon: `<svg viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      route: '/home'
    },
    {
      label: 'Post',
      icon: `<svg viewBox="0 0 24 24" fill="none"><path d="M12 4.5v15m7.5-7.5h-15" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      action: 'post-sheet'
    },
    {
      label: 'Messages',
      icon: `<svg viewBox="0 0 24 24" fill="none"><path d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      route: '/messages'
    },
    {
      label: 'Profile',
      route: '/profile',
      isProfile: true
    }
  ]);

  // Computed signal that adds unread badge to Messages
  navItemsWithBadge = computed(() => {
    return this.navItems().map(item => {
      if (item.route === '/messages') {
        return { ...item, badge: this.conversations.unreadTotal() };
      }
      return item;
    });
  });
  
  openPostSheet() {
    this.showPostSheet.set(true);
  }
  
  closePostSheet() {
    this.showPostSheet.set(false);
  }
  
  openProfileMenu() {
    this.showProfileMenu.set(true);
  }
  
  closeProfileMenu() {
    this.showProfileMenu.set(false);
  }
  
  openAssistant() {
    this.showAssistantModal.set(true);
  }
  
  closeAssistant() {
    this.showAssistantModal.set(false);
  }
  
  onAvatarError(event: Event) {
    // Fallback to default avatar on error
    const img = event.target as HTMLImageElement;
    img.src = '/default-avatar.svg';
  }

  constructor(private router: Router) {}
}
