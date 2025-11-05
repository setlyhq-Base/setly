import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserStore } from '../../core/state/user.store';
import { RiderStoreService } from '../../core/services/rider-store.service';
import { SearchBarComponent } from './search-bar.component';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, RouterLinkActive, SearchBarComponent],
  template: `
    <header class="bg-white border-b border-gray-200 px-4 py-3">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <!-- Logo -->
        <a routerLink="/" class="flex items-center space-x-2 text-gray-900 font-bold text-xl">
          <span class="northstar"></span>
          <span>SETLY</span>
        </a>

        <!-- Search -->
        <div class="hidden md:block flex-1 max-w-md mx-8">
          <app-search-bar></app-search-bar>
        </div>

        <!-- Navigation -->
        <nav class="flex items-center space-x-6">
          <a routerLink="/browse" routerLinkActive="text-brand-blue" class="text-gray-700 hover:text-gray-900 transition-colors">
            Browse
          </a>
          <a routerLink="/post-room" routerLinkActive="text-brand-blue" class="text-gray-700 hover:text-gray-900 transition-colors">
            Post Room
          </a>
          <a routerLink="/messages" routerLinkActive="text-brand-blue" class="text-gray-700 hover:text-gray-900 transition-colors">
            Messages
          </a>
          <a routerLink="/ride" routerLinkActive="text-brand-blue" class="text-gray-700 hover:text-gray-900 transition-colors">
            Ride
          </a>
          <a routerLink="/profile" routerLinkActive="text-brand-blue" class="text-gray-700 hover:text-gray-900 transition-colors">
            Profile
          </a>
          <a routerLink="/settings" routerLinkActive="text-brand-blue" class="text-gray-700 hover:text-gray-900 transition-colors">
            Settings
          </a>
          <span *ngIf="userStore.isAuthed()" data-testid="rider-quick-toggle" class="text-sm text-gray-600">
            Rider: {{ riderStore.enabled() ? 'On' : 'Off' }}
          </span>
          <a *ngIf="!userStore.isAuthed()" routerLink="/sign-in" class="btn">
            Sign In
          </a>
          <a *ngIf="!userStore.isAuthed()" routerLink="/sign-up" class="btn">
            Sign Up
          </a>
        </nav>
      </div>
    </header>
  `,
  styles: [`
    .northstar {
      @apply inline-block w-2.5 h-2.5 rounded-full bg-brand-blue align-middle;
    }
  `]
})
export class HeaderComponent {
  constructor(
    public userStore: UserStore,
    public riderStore: RiderStoreService
  ) {}
}
