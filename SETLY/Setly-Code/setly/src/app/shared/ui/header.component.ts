import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserStore } from '../../core/state/user.store';
import { AuthStore } from '../../core/state/auth.store';
import { AuthService } from '../../core/services/auth.service';
import { RiderStoreService } from '../../core/services/rider-store.service';
import { SearchBarComponent } from './search-bar.component';
import { ToastService } from '../../core/services/toast.service';
import { Router } from '@angular/router';
import { ConversationStoreService } from '../../features/messages/conversation-store.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, RouterLinkActive, SearchBarComponent],
  template: `
  <header class="app-header sticky top-0 z-50 px-4 py-3" [class.header-dark]="useDark">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <!-- Logo -->
  <a routerLink="/" class="flex items-center space-x-2 font-bold text-xl text-gray-900">
          <span class="northstar"></span>
          <span>SETLY</span>
        </a>

        <!-- Search -->
        <div class="hidden md:block flex-1 max-w-md mx-8">
          <app-search-bar></app-search-bar>
        </div>

        <!-- Navigation (restored legacy order: Connect · Post · Browse · Messages) -->
        <div class="flex items-center space-x-6" *ngIf="authStore.user().isAuthenticated; else loggedOut">
          <a routerLink="/connect" routerLinkActive="text-accent" class="nav-link">Connect</a>
          <a routerLink="/people" routerLinkActive="text-accent" class="nav-link">People</a>
          <a routerLink="/explore" routerLinkActive="text-accent" class="nav-link">Explore</a>
          <a routerLink="/post" routerLinkActive="text-accent" class="nav-link">Post</a>
          <a routerLink="/browse" routerLinkActive="text-accent" class="nav-link">Browse</a>
          <a routerLink="/messages" routerLinkActive="text-accent" class="nav-link relative">
            Messages
            <span *ngIf="conversations.unreadTotal() > 0" class="absolute -top-2 -right-3 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[11px] font-semibold text-white bg-rose-500 shadow-sm">{{ conversations.unreadTotal() }}</span>
          </a>
          <!-- Avatar dropdown -->
          <div class="relative profile-menu-wrapper">
            <button (click)="toggleMenu($event)" class="flex items-center gap-2 focus:outline-none" aria-haspopup="true" [attr.aria-expanded]="menuOpen" aria-label="Open profile menu">
              <span class="relative inline-block">
                <img [src]="authStore.user().avatarUrl || userStore.user()?.photoUrl" alt="Profile avatar" class="w-9 h-9 rounded-full object-cover border cursor-pointer" (mouseenter)="openMenu()"/>
                <span class="absolute -bottom-0.5 -right-0.5 block w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-white" aria-hidden="true"></span>
              </span>
              <svg class="w-4 h-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.243 4.5a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z" clip-rule="evenodd"/></svg>
            </button>
            <div *ngIf="menuOpen" class="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50" role="menu" (mouseenter)="cancelClose()" (mouseleave)="scheduleClose()">
              <a routerLink="/profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg" role="menuitem">Profile</a>
              <button (click)="signOut()" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg" role="menuitem">Sign Out</button>
            </div>
          </div>
        </div>
        <ng-template #loggedOut>
          <nav class="flex items-center space-x-6">
            <a routerLink="/connect" routerLinkActive="text-accent" class="nav-link">Connect</a>
            <a routerLink="/people" routerLinkActive="text-accent" class="nav-link">People</a>
            <a routerLink="/explore" routerLinkActive="text-accent" class="nav-link">Explore</a>
            <a routerLink="/post" routerLinkActive="text-accent" class="nav-link">Post</a>
            <a routerLink="/browse" routerLinkActive="text-accent" class="nav-link">Browse</a>
            <a routerLink="/messages" routerLinkActive="text-accent" class="nav-link relative">
              Messages
              <span *ngIf="conversations.unreadTotal() > 0" class="absolute -top-2 -right-3 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[11px] font-semibold text-white bg-rose-500 shadow-sm">{{ conversations.unreadTotal() }}</span>
            </a>
            <button (click)="goToSignIn()" class="btn-secondary">Sign In</button>
          </nav>
        </ng-template>
      </div>
    </header>
  `,
  styles: [`
    .northstar {
      @apply inline-block w-2.5 h-2.5 rounded-full align-middle;
      background-color: rgb(59 130 246 / var(--tw-bg-opacity, 1));
    }
    .nav-link { @apply text-gray-700 hover:text-gray-900 transition-colors; font-weight:500; }
  `]
})
export class HeaderComponent {
  menuOpen = false;
  private closeTimeout: any;
  useDark = false;
  constructor(
    public userStore: UserStore,
    public riderStore: RiderStoreService,
    private authService: AuthService,
    public authStore: AuthStore,
    private toast: ToastService,
    private router: Router,
    public conversations: ConversationStoreService
  ) {
    // Bridge legacy window 'toast' events to central ToastService (for AuthSync, etc.)
    window.addEventListener('toast', (e: any) => {
      const detail = e.detail;
      if (detail?.message) {
        const type = detail.type || 'info';
        this.toast.show(detail.message, type);
      }
    });
    // Simple heuristic: enable dark header on profile pages for premium feel
    const path = window.location.pathname;
    if (/\/profile/.test(path)) this.useDark = true;
  }

  async signOut() {
    this.menuOpen = false;
    this.router.navigate(['/auth/sign-out']);
  }

  goToSignIn() {
    const next = location.pathname + location.search + location.hash;
    this.router.navigate(['/auth/sign-in'], { queryParams: { next } });
  }

  toggleMenu(ev: Event) {
    ev.stopPropagation();
    this.menuOpen = !this.menuOpen;
    if (this.menuOpen) this.bindOutside();
  }
  openMenu() {
    if (!this.menuOpen) {
      this.menuOpen = true;
      this.bindOutside();
    }
  }
  scheduleClose() {
    this.closeTimeout = setTimeout(() => this.menuOpen = false, 150);
  }
  cancelClose() {
    if (this.closeTimeout) clearTimeout(this.closeTimeout);
  }
  private bindOutside() {
    const handler = (e: any) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.profile-menu-wrapper')) {
        this.menuOpen = false;
        window.removeEventListener('click', handler, true);
      }
    };
    setTimeout(() => window.addEventListener('click', handler, true), 0);
  }
}
