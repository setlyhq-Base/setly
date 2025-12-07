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
      background: white;
      border-top: 1px solid rgba(0, 0, 0, 0.08);
      padding-bottom: env(safe-area-inset-bottom, 0);
      box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.08);
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
      height: 56px;
      max-width: 100%;
      margin: 0 auto;
      padding: 0 8px;
    }
    
    .nav-item {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      padding: 6px 12px;
      min-width: 64px;
      text-decoration: none;
      color: #6B7280;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      -webkit-tap-highlight-color: transparent;
      border-radius: 12px;
    }
    
    .nav-item:active {
      transform: scale(0.95);
      background: rgba(78, 123, 253, 0.08);
    }
    
    .nav-item.active {
      color: #4E7BFD;
    }
    
    .nav-item.active .nav-icon {
      transform: translateY(-2px);
    }
    
    .nav-icon {
      width: 24px;
      height: 24px;
      transition: transform 0.2s ease;
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
      fill-opacity: 0.15;
    }
    
    .nav-label {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.01em;
      line-height: 1;
    }
    
    .nav-badge {
      position: absolute;
      top: 4px;
      right: 8px;
      min-width: 16px;
      height: 16px;
      padding: 0 4px;
      background: #EF4444;
      color: white;
      font-size: 10px;
      font-weight: 700;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
    }
  `]
})
export class BottomNavComponent {
  navItems = signal<NavItem[]>([
    {
      label: 'Home',
      icon: `<svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
      route: '/home'
    },
    {
      label: 'Rooms',
      icon: `<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="15" x2="15" y2="15"/></svg>`,
      route: '/browse/rooms'
    },
    {
      label: 'Rides',
      icon: `<svg viewBox="0 0 24 24"><path d="M17 12h3l3 5v6h-2v-2H3v2H1v-6l3-5h3"/><circle cx="6.5" cy="18.5" r="2.5"/><circle cx="17.5" cy="18.5" r="2.5"/><path d="M4 12V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6"/></svg>`,
      route: '/ride'
    },
    {
      label: 'Shop',
      icon: `<svg viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`,
      route: '/search/marketplace'
    },
    {
      label: 'People',
      icon: `<svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
      route: '/people'
    }
  ]);

  constructor(private router: Router) {}
}
