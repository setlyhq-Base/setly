import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConnectFeedResponse, AnyConnectPost, RoomPost, RidePost, EventPost, ThreadPost, UpdatePost, MarketPost } from '../models/connect.models';
import { ConnectFiltersService } from '../../../core/services/connect-filters.service';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { PostRoomCardComponent } from './post-room-card.component';
import { PostRideCardComponent } from './post-ride-card.component';
import { PostEventCardComponent } from './post-event-card.component';
import { PostThreadCardComponent } from './post-thread-card.component';
import { PostUpdateCardComponent } from './post-update-card.component';
import { RouterModule } from '@angular/router';
import { PostPersonCardComponent } from './post-person-card.component';
import { PostMarketCardComponent } from './post-market-card.component';
import { AssistantService } from '../../assistant/assistant.service';

@Component({
  selector: 'app-connect-feed',
  standalone: true,
  imports: [CommonModule, RouterModule, PostPersonCardComponent, PostRoomCardComponent, PostRideCardComponent, PostEventCardComponent, PostThreadCardComponent, PostUpdateCardComponent, PostMarketCardComponent],
  template: `
    <div class="space-y-4" [class.market-grid]="isMarketplace(feed.posts)">
      <ng-container *ngIf="feed.posts?.length; else empty">
        <div *ngFor="let post of feed.posts; trackBy: trackById" class="fade-slide-enter fade-slide-enter-active">
          <app-post-person-card *ngIf="isPerson(post)" [post]="post" (opened)="onOpen(post)"></app-post-person-card>
          <app-post-room-card *ngIf="isRoom(post)" [post]="post" (opened)="onOpen(post)"></app-post-room-card>
          <app-post-ride-card *ngIf="isRide(post)" [post]="post" (opened)="onOpen(post)"></app-post-ride-card>
          <app-post-event-card *ngIf="isEvent(post)" [post]="post" (opened)="onOpen(post)"></app-post-event-card>
          <app-post-thread-card *ngIf="isThread(post)" [post]="post" (opened)="onOpen(post)"></app-post-thread-card>
          <app-post-update-card *ngIf="isUpdate(post)" [post]="post" (opened)="onOpen(post)"></app-post-update-card>
          <app-post-market-card *ngIf="isMarket(post)" [post]="post" (opened)="onOpen(post)"></app-post-market-card>
        </div>

        <!-- End-of-results indicator -->
        <div *ngIf="feed?.posts?.length && !feed?.nextCursor" class="text-center text-sm text-gray-600 py-4" aria-label="End of results">
          You’re all caught up. Check back soon for more.
        </div>
      </ng-container>

      <ng-template #empty>
        <div class="card-white p-8">
          <!-- Minimal illustration: abstract grid + lines -->
          <div class="mb-4" aria-hidden="true">
            <svg width="100%" height="80" viewBox="0 0 600 80" fill="none">
              <rect x="10" y="20" width="60" height="40" rx="8" stroke="#A5B4FC" stroke-opacity="0.4"/>
              <rect x="90" y="20" width="60" height="40" rx="8" stroke="#A5B4FC" stroke-opacity="0.25"/>
              <rect x="170" y="20" width="60" height="40" rx="8" stroke="#A5B4FC" stroke-opacity="0.15"/>
              <line x1="260" y1="28" x2="560" y2="28" stroke="#A5B4FC" stroke-opacity="0.25"/>
              <line x1="260" y1="40" x2="520" y2="40" stroke="#A5B4FC" stroke-opacity="0.2"/>
              <line x1="260" y1="52" x2="480" y2="52" stroke="#A5B4FC" stroke-opacity="0.15"/>
            </svg>
          </div>
          <h2 class="text-xl font-semibold mb-1">Your network is just getting started.</h2>
          <p class="text-sm text-gray-600 mb-4">Follow universities, explore rooms, and connect with people who share your journey.</p>
          <div class="mb-4">
            <button (click)="askAssistant()" class="px-4 py-2 rounded-md text-sm inline-flex items-center gap-2 border focus-ring">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3a9 9 0 100 18 9 9 0 000-18zm-1 5h2v6h-2V8zm1 9a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" stroke="#5A4FF3" stroke-width="1.2"/></svg>
              Ask Setly Assistant
            </button>
          </div>
          <div class="flex flex-wrap gap-3 mb-4">
            <a routerLink="/browse" class="btn-brand px-4 py-2 rounded-md text-sm" (click)="suggestClick('browse_rooms')">Browse Rooms</a>
            <a routerLink="/ride" class="px-4 py-2 border rounded-md text-sm" (click)="suggestClick('setlyride')">Explore SetlyRide</a>
          </div>
          <div class="flex flex-wrap gap-2 mb-6">
            <button class="px-3 py-1 rounded-full border text-xs flex items-center gap-1" (click)="applySuggestion({ city: 'Boston' })">
              <!-- City skyline icon -->
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M3 20h18M6 20V10m4 10V6m4 14v-8m4 8v-5" stroke="#E5E1FF" stroke-width="1.5"/>
              </svg>
              <span>#Boston</span>
            </button>
            <button class="px-3 py-1 rounded-full border text-xs flex items-center gap-1" (click)="applySuggestion({ maxPrice: 1000 })">
              <!-- Wallet icon -->
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="3" y="6" width="18" height="12" rx="2" stroke="#E5E1FF" stroke-width="1.5"/>
                <circle cx="16" cy="12" r="1" fill="#E5E1FF"/>
              </svg>
              <span>#Under$1000</span>
            </button>
            <button class="px-3 py-1 rounded-full border text-xs flex items-center gap-1" (click)="applySuggestion({ verifiedOnly: true })">
              <!-- Verification badge icon -->
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 3l2.5 2.3 3.5-.4-.9 3.4 2 2.8-3.3.9-1.3 3.1-2.5-2-3 1 .5-3.2-2.4-2.2 3.3-.6L12 3z" stroke="#E5E1FF" stroke-width="1" fill="none"/>
                <path d="M9.5 12l1.5 1.5 3-3" stroke="#E5E1FF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>#VerifiedOnly</span>
            </button>
          </div>
          <!-- Skeleton posts to preserve layout -->
          <div class="grid gap-4">
            <div *ngFor="let sk of skeletons" class="card-white p-4">
              <div class="h-5 w-32 rounded mb-3 skeleton"></div>
              <div class="h-3 w-full rounded mb-2 skeleton"></div>
              <div class="h-3 w-2/3 rounded skeleton"></div>
            </div>
          </div>
        </div>
      </ng-template>

      <!-- Safety notice for marketplace -->
  <div *ngIf="isMarketplace(feed.posts)" class="text-[12px] text-gray-600 flex items-center gap-2">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="#9CA3AF" stroke-width="1.2"/><path d="M12 8v5" stroke="#9CA3AF" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="16" r="1" fill="#9CA3AF"/></svg>
        All transactions happen directly — verify before meeting.
      </div>

      <!-- Manual pagination instead of infinite scroll -->
      <div class="py-6 text-center" *ngIf="feed.nextCursor">
        <button (click)="requestMore.emit()" [disabled]="loading" class="px-6 py-3 rounded-full btn-brand text-base font-semibold shadow focus-ring transition inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed" [attr.aria-busy]="loading">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="#4F46E5" stroke-width="2" stroke-linecap="round"/></svg>
          {{ loading ? 'Loading…' : 'Load More' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .market-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
    @media (max-width: 767px) { .market-grid { grid-template-columns: 1fr; } }
  `]
})
export class ConnectFeedComponent {
  @Input() feed!: ConnectFeedResponse;
  @Input() loading: boolean = false;
  @Output() requestMore = new EventEmitter<void>();
  @Output() postOpened = new EventEmitter<AnyConnectPost>();
  private filters = inject(ConnectFiltersService);
  private analytics = inject(AnalyticsService);
  private assistant = inject(AssistantService);
  skeletons = Array(3).fill(0);

  onOpen(p: AnyConnectPost) { this.postOpened.emit(p); }
  trackById(i: number, p: AnyConnectPost){ return p.id; }

  // Type guards for template
  isRoom(p: AnyConnectPost): p is RoomPost { return p.type === 'room'; }
  isPerson(p: AnyConnectPost){ return p.type === 'person'; }
  isRide(p: AnyConnectPost): p is RidePost { return p.type === 'ride'; }
  isEvent(p: AnyConnectPost): p is EventPost { return p.type === 'event'; }
  isThread(p: AnyConnectPost): p is ThreadPost { return p.type === 'thread'; }
  isUpdate(p: AnyConnectPost): p is UpdatePost { return p.type === 'update'; }
  isMarket(p: AnyConnectPost): p is MarketPost { return (p as any).type === 'market'; }
  isMarketplace(posts?: AnyConnectPost[] | null | undefined){ return !!posts && posts.length>0 && posts.every(p => (p as any).type === 'market'); }

  applySuggestion(partial: any){ this.filters.setFilters(partial); this.analytics.track('suggest_connect_clicked', partial); }
  suggestClick(action: string){ this.analytics.track('suggest_connect_clicked', { action }); }
  askAssistant(){
    const f = this.filters.filters()();
    const parts: string[] = [];
    if (f.city) parts.push(`in ${f.city}`);
    if (f.verifiedOnly) parts.push('verified only');
    if (f.maxPrice) parts.push(`under $${f.maxPrice}`);
    const prompt = `Help me find people and places ${parts.join(', ') || 'to connect with'}.`;
    this.analytics.track('assistant_seed_from_empty', { filters: f });
    this.assistant.onOpen();
    this.assistant.sendUserMessage?.(prompt);
  }
}
