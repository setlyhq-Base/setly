import { Component, signal, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ConversationStoreService } from '../../features/messages/conversation-store.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="bottom-nav" aria-label="Mobile navigation">
      <div class="bottom-nav-container">
        @for (item of navItemsWithBadge(); track item.route) {
          <a 
            [routerLink]="item.route"
            routerLinkActive="active"
            class="nav-item"
            [attr.aria-label]="item.label">
            <span class="nav-icon" [innerHTML]="item.icon"></span>
            <span class="nav-label">{{ item.label }}</span>
            @if (item.badge && item.badge > 0) {
              <span class="nav-badge">{{ item.badge }}</span>
            }
          </a>
        }
      </div>
    </nav>
  `,
  styles: [`
    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 50;
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border-top: 1px solid rgba(226, 232, 240, 0.8);
      padding-bottom: env(safe-area-inset-bottom, 0);
      box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.06), 0 -1px 3px rgba(0, 0, 0, 0.04);
      display: block;
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
      height: 60px;
      max-width: 100%;
      margin: 0 auto;
      padding: 6px 4px;
      gap: 2px;
    }
    
    .nav-item {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
      padding: 6px 8px;
      min-width: 48px;
      flex: 1;
      text-decoration: none;
      color: #6B7280;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      -webkit-tap-highlight-color: transparent;
      border-radius: 12px;
    }
    
    .nav-item:active {
      transform: scale(0.92);
      background: rgba(59, 130, 246, 0.08);
    }
    
    .nav-item.active {
      color: #3b82f6;
      background: rgba(59, 130, 246, 0.06);
    }
    
    .nav-item.active .nav-icon {
      transform: translateY(-3px);
      filter: drop-shadow(0 2px 6px rgba(59, 130, 246, 0.3));
    }
    
    .nav-icon {
      width: 22px;
      height: 22px;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .nav-icon :deep(svg) {
      width: 100%;
      height: 100%;
      stroke: currentColor;
      fill: none;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    
    .nav-item.active .nav-icon :deep(svg) {
      stroke-width: 2.5;
      fill: currentColor;
      fill-opacity: 0.12;
    }
    
    .nav-label {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.02em;
      line-height: 1.2;
      text-align: center;
    }
    
    .nav-item.active .nav-label {
      font-weight: 700;
    }
    
    .nav-badge {
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
        transform: scale(1.1);
      }
    }
  `]
})
export class BottomNavComponent {
  private conversations = inject(ConversationStoreService);
  
  navItems = signal<NavItem[]>([
    {
      label: 'Connect',
      icon: `<svg viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`,
      route: '/connect'
    },
    {
      label: 'People',
      icon: `<svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
      route: '/people'
    },
    {
      label: 'Explore',
      icon: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`,
      route: '/explore'
    },
    {
      label: 'Post',
      icon: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
      route: '/post'
    },
    {
      label: 'Browse',
      icon: `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
      route: '/browse'
    },
    {
      label: 'Messages',
      icon: `<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
      route: '/messages'
    },
    {
      label: 'Profile',
      icon: `<svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
      route: '/profile'
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

  constructor(private router: Router) {}
}
