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
  <header class="app-header sticky top-0 z-50 bg-white/85 backdrop-blur px-4 py-2 md:py-3" [class.header-dark]="useDark">
      <div class="max-w-7xl mx-auto flex items-center justify-between gap-3 md:gap-8">
        <div class="flex items-center gap-3 flex-1 md:flex-none">
          <button type="button" class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm md:hidden" (click)="toggleMobileNav()" aria-label="Toggle navigation" [attr.aria-expanded]="mobileNavOpen">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 7h16M4 12h16M4 17h10" />
            </svg>
          </button>
          <a routerLink="/" class="flex min-w-0 items-center gap-2 font-semibold text-lg text-gray-900 md:text-xl" (click)="closeMobileNav()">
            <span class="northstar"></span>
            <span class="truncate uppercase tracking-[0.15em]">Setly</span>
          </a>
        </div>

        <div class="hidden md:block flex-1 max-w-md">
          <app-search-bar></app-search-bar>
        </div>

        <div class="flex items-center gap-2 md:gap-6">
          <button type="button" class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm md:hidden" (click)="toggleSearch()" aria-label="Toggle search">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-4.35-4.35M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" />
            </svg>
          </button>

          <a routerLink="/messages" class="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm md:hidden" aria-label="Messages" (click)="closeMobileNav()">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M7 8h10M7 12h6" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 4h14a2 2 0 0 1 2 2v10.172a2 2 0 0 1-.586 1.414l-3.828 3.828A2 2 0 0 1 15.172 22H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
            </svg>
            <span *ngIf="conversations.unreadTotal() > 0" class="absolute -top-1 -right-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-semibold text-white shadow-sm">{{ conversations.unreadTotal() }}</span>
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

      <div class="md:hidden" *ngIf="searchExpanded">
        <div class="mx-auto mt-3 max-w-7xl">
          <app-search-bar></app-search-bar>
        </div>
      </div>

      <div *ngIf="mobileNavOpen" class="md:hidden">
        <nav class="fixed inset-x-0 top-[60px] z-40 max-h-[calc(100vh-60px)] overflow-y-auto border-t border-gray-200 bg-white/95 px-4 py-4 shadow-lg">
          <div class="space-y-1" *ngIf="authStore.user().isAuthenticated; else loggedOutMobile">
            <ng-container *ngFor="let link of navLinks">
              <a [routerLink]="link.route" routerLinkActive="bg-gray-100 text-gray-900" class="mobile-nav-item" (click)="closeMobileNav()">{{ link.label }}</a>
            </ng-container>
            <a routerLink="/messages" routerLinkActive="bg-gray-100 text-gray-900" class="mobile-nav-item relative" (click)="closeMobileNav()">
              Messages
              <span *ngIf="conversations.unreadTotal() > 0" class="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-rose-500 px-2 py-0.5 text-xs font-semibold text-white">{{ conversations.unreadTotal() }}</span>
            </a>
            <a routerLink="/profile" routerLinkActive="bg-gray-100 text-gray-900" class="mobile-nav-item" (click)="closeMobileNav()">Profile</a>
            <button (click)="signOut()" class="mobile-nav-item text-left text-red-600">Sign Out</button>
          </div>
          <ng-template #loggedOutMobile>
            <div class="space-y-1">
              <ng-container *ngFor="let link of navLinks">
                <a [routerLink]="link.route" routerLinkActive="bg-gray-100 text-gray-900" class="mobile-nav-item" (click)="closeMobileNav()">{{ link.label }}</a>
              </ng-container>
              <a routerLink="/messages" routerLinkActive="bg-gray-100 text-gray-900" class="mobile-nav-item" (click)="closeMobileNav()">Messages</a>
              <button (click)="goToSignIn()" class="mobile-nav-item text-left text-accent">Sign In</button>
            </div>
          </ng-template>
        </nav>
      </div>

      <nav class="md:hidden" *ngIf="authStore.user().isAuthenticated">
        <div class="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 py-2 shadow-lg">
          <ul class="mx-auto flex max-w-7xl items-center justify-between px-6 text-[11px] font-medium uppercase tracking-[0.08em] text-gray-500">
            <li>
              <a routerLink="/connect" routerLinkActive="text-accent" class="mobile-nav-link" (click)="closeMobileNav()">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 10a4 4 0 1 1 8 0v1h1a3 3 0 0 1 3 3v5H4v-5a3 3 0 0 1 3-3h1v-1Z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 17h.01" />
                </svg>
                <span>Connect</span>
              </a>
            </li>
            <li>
              <a routerLink="/explore" routerLinkActive="text-accent" class="mobile-nav-link" (click)="closeMobileNav()">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 19V5a2 2 0 0 1 2-2h6.172a2 2 0 0 1 1.414.586l4.828 4.828A2 2 0 0 1 19 9.828V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 3v6h6" />
                </svg>
                <span>Your next move</span>
              </a>
            </li>
            <li>
              <a routerLink="/post" routerLinkActive="text-accent" class="mobile-nav-link" (click)="closeMobileNav()">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14M5 12h14" />
                </svg>
                <span>Post</span>
              </a>
            </li>
            <li>
              <a routerLink="/messages" routerLinkActive="text-accent" class="mobile-nav-link relative" (click)="closeMobileNav()">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9.172a2 2 0 0 1-.586 1.414l-3.828 3.828A2 2 0 0 1 15.172 20H5a2 2 0 0 1-2-2V5Z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="m7 7 5 4 5-4" />
                </svg>
                <span>Messages</span>
                <span *ngIf="conversations.unreadTotal() > 0" class="absolute right-1 top-0 -translate-y-1/2 rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">{{ conversations.unreadTotal() }}</span>
              </a>
            </li>
            <li>
              <a routerLink="/profile" routerLinkActive="text-accent" class="mobile-nav-link" (click)="closeMobileNav()">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 20a8 8 0 1 1 16 0" />
                </svg>
                <span>Profile</span>
              </a>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  `,
  styles: [`
    .northstar {
      @apply inline-block w-2.5 h-2.5 rounded-full align-middle;
      background-color: rgb(59 130 246 / var(--tw-bg-opacity, 1));
    }
    .nav-link { @apply text-gray-700 hover:text-gray-900 transition-colors; font-weight:500; }
    .mobile-nav-item { @apply flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium text-gray-600 transition-colors; }
    .mobile-nav-link { @apply flex flex-col items-center gap-1 text-gray-500 transition-colors hover:text-gray-900; }
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
    { label: 'Explore', route: '/explore' },
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
