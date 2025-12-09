import { Component, DestroyRef } from '@angular/core';
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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, RouterLinkActive, SearchBarComponent],
  template: `
  <header class="app-header sticky top-0 z-50 bg-white/85 backdrop-blur px-4 py-2 md:py-3 hidden md:block" [class.dark]="useDark">
    <div class="max-w-7xl mx-auto flex items-center justify-between gap-3 md:gap-8">
        <div class="flex items-center gap-3 flex-1 md:flex-none">
          <a routerLink="/" class="flex min-w-0 items-center gap-2 text-lg text-gray-900 md:text-xl" (click)="closeMobileNav()">
            <span class="logo-dots-container">
              <span class="northstar northstar-1"></span>
              <span class="northstar northstar-2"></span>
            </span>
            <span class="truncate uppercase tracking-[0.15em] font-normal">Setly</span>
          </a>
        </div>

        <div class="hidden md:block flex-1 max-w-md">
          <app-search-bar></app-search-bar>
        </div>

        <div class="flex items-center gap-2 md:gap-6">
          <!-- Mobile Profile Icon (top-right) -->
          <a routerLink="/profile" class="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm md:hidden" aria-label="Profile" (click)="closeMobileNav()">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </a>

          <div class="hidden md:flex items-center gap-6" *ngIf="authStore.user().isAuthenticated; else loggedOutDesktop">
            <ng-container *ngFor="let link of navLinks">
              <a [routerLink]="link.route" routerLinkActive="text-accent" class="nav-link">{{ link.label }}</a>
            </ng-container>
            <a routerLink="/messages" routerLinkActive="text-accent" class="nav-link relative">
              Messages
              <span *ngIf="conversations.unreadTotal() > 0" class="absolute -top-2 -right-3 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[11px] font-semibold text-white bg-rose-500 shadow-sm">{{ conversations.unreadTotal() }}</span>
            </a>
            <div class="relative profile-menu-wrapper">
              <button (click)="toggleMenu($event)" class="flex items-center gap-2 focus:outline-none" aria-haspopup="true" [attr.aria-expanded]="menuOpen" aria-label="Open profile menu">
                <span class="relative inline-block">
                  <img [src]="authStore.user().avatarUrl || userStore.user()?.photoUrl" alt="Profile avatar" class="h-9 w-9 cursor-pointer rounded-full border object-cover" (mouseenter)="openMenu()" />
                  <span class="absolute -bottom-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white" aria-hidden="true"></span>
                </span>
                <svg class="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.243 4.5a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z" clip-rule="evenodd"/></svg>
              </button>
              <div *ngIf="menuOpen" class="absolute right-0 mt-2 w-48 rounded-xl border border-gray-200 bg-white py-2 shadow-lg z-50" role="menu" (mouseenter)="cancelClose()" (mouseleave)="scheduleClose()">
                <a routerLink="/profile" class="block rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" role="menuitem" (click)="closeMobileNav()">Profile</a>
                <button (click)="signOut()" class="w-full rounded-lg px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50" role="menuitem">Sign Out</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ng-template #loggedOutDesktop>
        <nav class="hidden md:flex items-center gap-6">
          <ng-container *ngFor="let link of navLinks">
            <a [routerLink]="link.route" routerLinkActive="text-accent" class="nav-link">{{ link.label }}</a>
          </ng-container>
          <a routerLink="/messages" routerLinkActive="text-accent" class="nav-link relative">
            Messages
            <span *ngIf="conversations.unreadTotal() > 0" class="absolute -top-2 -right-3 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[11px] font-semibold text-white bg-rose-500 shadow-sm">{{ conversations.unreadTotal() }}</span>
          </a>
          <button (click)="goToSignIn()" class="btn-secondary">Sign In</button>
        </nav>
      </ng-template>
    </header>
  `,
  styles: [`
    .logo-dots-container {
      @apply inline-flex relative;
      width: 14px;
      height: 1.1em;
      flex-shrink: 0;
      margin-right: 6px;
    }
    .northstar {
      @apply absolute rounded-full;
      width: 6px;
      height: 6px;
      background-color: #4E7BFD;
    }
    .northstar-1 {
      top: 0;
      right: 0;
    }
    .northstar-2 {
      bottom: 0;
      left: 0;
    }
    .nav-link { @apply text-gray-700 hover:text-gray-900 transition-colors; font-weight:500; }
  `]
})
export class HeaderComponent {
  menuOpen = false;
  private closeTimeout: any;
  useDark = false;
  mobileNavOpen = false;
  searchExpanded = false;
  readonly navLinks = [
    { label: 'Connect', route: '/connect' },
    { label: 'People', route: '/people' },
    { label: 'Home', route: '/home' },
    { label: 'Post', route: '/post' },
    { label: 'Browse', route: '/browse' }
  ];
  constructor(
    public userStore: UserStore,
    public riderStore: RiderStoreService,
    private authService: AuthService,
    public authStore: AuthStore,
    private toast: ToastService,
    private router: Router,
    public conversations: ConversationStoreService,
    private destroyRef: DestroyRef
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

    this.router.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.mobileNavOpen = false;
        this.searchExpanded = false;
      });
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
  toggleMobileNav() {
    this.mobileNavOpen = !this.mobileNavOpen;
    if (this.mobileNavOpen) {
      this.searchExpanded = false;
    }
    if (this.menuOpen) {
      this.menuOpen = false;
    }
  }
  closeMobileNav() {
    this.mobileNavOpen = false;
    this.searchExpanded = false;
    if (this.menuOpen) {
      this.menuOpen = false;
    }
  }
  toggleSearch() {
    this.searchExpanded = !this.searchExpanded;
    if (this.searchExpanded) {
      this.mobileNavOpen = false;
    }
    if (this.menuOpen) {
      this.menuOpen = false;
    }
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
