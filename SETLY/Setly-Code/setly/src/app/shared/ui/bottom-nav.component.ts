import { Component, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

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
        @for (item of navItems(); track item.route) {
          <a 
            [routerLink]="item.route"
            routerLinkActive="active"
            class="nav-item"
            [attr.aria-label]="item.label">
            <span class="nav-icon" [innerHTML]="item.icon"></span>
            <span class="nav-label">{{ item.label }}</span>
            @if (item.badge) {
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
      padding: 6px 8px;
    }
    
    .nav-item {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 8px 10px;
      min-width: 56px;
      text-decoration: none;
      color: #6B7280;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      -webkit-tap-highlight-color: transparent;
      border-radius: 14px;
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
  navItems = signal<NavItem[]>([
    {
      label: 'Connect',
      icon: `<svg viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>`,
      route: '/connect'
    },
    {
      label: 'People',
      icon: `<svg viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`,
      route: '/people'
    },
    {
      label: 'Explore',
      icon: `<svg viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>`,
      route: '/explore'
    },
    {
      label: 'Post',
      icon: `<svg viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>`,
      route: '/post'
    },
    {
      label: 'Browse',
      icon: `<svg viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>`,
      route: '/browse'
    },
    {
      label: 'Messages',
      icon: `<svg viewBox="0 0 24 24"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>`,
      route: '/messages'
    }
  ]);

  constructor(private router: Router) {}
}
