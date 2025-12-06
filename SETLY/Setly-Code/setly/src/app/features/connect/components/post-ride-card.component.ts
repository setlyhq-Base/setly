import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RidePost } from '../models/connect.models';
import { ConnectFeedService } from '../../../core/services/connect-feed.service';
import { Router, RouterModule } from '@angular/router';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { AssistantService } from '../../assistant/assistant.service';
import { ToastService } from '../../../core/services/toast.service';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';

@Component({
  selector: 'app-post-ride-card',
  standalone: true,
  imports: [CommonModule, RouterModule, TimeAgoPipe],
  template: `
  <article class="card-premium hover-lift overflow-hidden unified-feed-card cursor-pointer" [attr.aria-label]="post.from + ' to ' + post.to" role="article" (click)="navigateToDetail()" tabindex="0" (keydown.enter)="navigateToDetail()" (keydown.space)="$event.preventDefault(); navigateToDetail()">
      <header class="flex items-center justify-between p-5 border-b border-[#ECECEC]">
        <div class="flex items-center gap-3">
          <div class="relative">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-[#3E8FFF] to-[#2D7FEF] text-white flex items-center justify-center text-sm font-semibold" [attr.aria-label]="'Driver ' + post.authorId">{{post.authorId[0]}}</div>
            <span *ngIf="post.presence==='online'" class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 ring-2 ring-white" aria-label="Active now"></span>
          </div>
          <div class="text-sm leading-tight">
            <div class="font-semibold text-[#0A1A3F] flex items-center gap-1.5">
              <span>{{post.authorId}}</span>
              <span *ngIf="post.driverVerified" class="text-xs px-2 py-0.5 rounded-full border border-[rgba(62,143,255,0.2)] text-[#3E8FFF] bg-[rgba(62,143,255,0.08)] inline-flex items-center gap-1" aria-label="Verified driver">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 12l2 2 4-4" stroke="#3E8FFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                Verified
              </span>
            </div>
            <div class="text-[#6F7785] text-xs">{{post.createdAt | timeAgo}}</div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button type="button" (click)="askSetly()" class="text-xs px-3 py-1.5 border border-[#ECECEC] rounded-lg hover:border-[#3E8FFF] hover:text-[#3E8FFF] transition-colors font-medium" aria-label="Ask Setly about ride">Ask Setly</button>
          <button type="button" (click)="hide()" class="text-xs px-3 py-1.5 border border-[#ECECEC] rounded-lg hover:border-[#6F7785] hover:text-[#6F7785] transition-colors font-medium" aria-label="Hide ride">Hide</button>
        </div>
      </header>
      <div class="p-5 space-y-4">
        <div class="flex flex-wrap items-center gap-3" aria-label="Route">
          <span class="px-3 py-1.5 rounded-xl border border-[#ECECEC] text-sm bg-white font-medium text-[#0A1A3F]" aria-label="From">{{post.from}}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7" stroke="#3E8FFF" stroke-width="2" stroke-linecap="round"/></svg>
          <span class="px-3 py-1.5 rounded-xl border border-[#ECECEC] text-sm bg-white font-medium text-[#0A1A3F]" aria-label="To">{{post.to}}</span>
          <span class="ml-auto text-xs px-3 py-1.5 rounded-full border font-medium" [class.border-[rgba(62,143,255,0.3)]]="post.seats && post.seats>1" [class.text-[#3E8FFF]]="post.seats && post.seats>1" [class.bg-[rgba(62,143,255,0.05)]]="post.seats && post.seats>1">{{post.seats || 1}} seat{{(post.seats||1)>1 ? 's' : ''}} left</span>
        </div>
        <div class="text-sm text-[#6F7785] flex flex-wrap items-center gap-3">
          <span class="inline-flex items-center gap-1.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" stroke-width="1.5"/></svg>
            {{post.when | date:'short'}}
          </span>
          <span *ngIf="post.isSetlyRide" class="inline-flex items-center gap-1 text-[#3E8FFF] text-xs px-2 py-1 rounded-full bg-[rgba(62,143,255,0.08)] border border-[rgba(62,143,255,0.2)] font-medium" aria-label="SetlyRide">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 12l2-5h14l2 5v5H3v-5z" stroke="#3E8FFF" stroke-width="1.5"/><circle cx="7.5" cy="17" r="1.5" fill="#3E8FFF"/><circle cx="16.5" cy="17" r="1.5" fill="#3E8FFF"/></svg>
            SetlyRide
          </span>
          <span *ngIf="post.mutualsJoined" class="inline-flex items-center gap-1 text-xs text-[#6F7785]" aria-label="Mutuals joined">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            {{post.mutualsJoined}} mutual{{post.mutualsJoined>1?'s':''}} joined
          </span>
        </div>
        <div class="flex flex-wrap gap-2 pt-2">
          <button type="button" (click)="like()" class="px-4 py-2 border border-[#ECECEC] rounded-lg text-sm font-medium hover:border-[#3E8FFF] hover:text-[#3E8FFF] transition-colors" aria-label="Like ride">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" class="inline-block mr-1"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="currentColor" stroke-width="1.5"/></svg>
            {{post.likes || 0}}
          </button>
          <button type="button" (click)="save()" class="px-4 py-2 border rounded-lg text-sm font-medium transition-colors" [class.border-[#3E8FFF]]="post.saved" [class.text-[#3E8FFF]]="post.saved" [class.bg-[rgba(62,143,255,0.05)]]="post.saved" [class.border-[#ECECEC]]="!post.saved" [class.hover:border-[#3E8FFF]]="!post.saved" aria-label="Save ride">{{post.saved ? 'Saved' : 'Save'}}</button>
          <button type="button" (click)="openUber()" class="px-4 py-2 border border-[#ECECEC] rounded-lg text-sm font-medium hover:border-[#3E8FFF] hover:text-[#3E8FFF] transition-colors" aria-label="Open in Uber">Open Uber</button>
          <button type="button" (click)="open()" class="px-4 py-2 bg-[#3E8FFF] text-white rounded-lg text-sm font-semibold hover:bg-[#2D7FEF] transition-colors shadow-md" aria-label="Request SetlyRide">Request Ride</button>
        </div>
        <div class="pt-1">
          <a [routerLink]="['/messages']" [queryParams]="{ with: post.hostId, listing: post.id }" class="text-sm text-[#3E8FFF] hover:underline font-medium inline-flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" stroke-width="1.5"/></svg>
            Chat with Driver
          </a>
        </div>
      </div>
    </article>
  `,
  styles: [`
    .card-premium {
      background: #FFFFFF; 
      border-radius: 20px; 
      border: 1px solid #ECECEC;
      box-shadow: 0 4px 16px -4px rgba(10, 26, 63, 0.08), 0 2px 8px -2px rgba(0, 0, 0, 0.04); 
      transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.25s ease;
    }
    .card-premium:hover {
      transform: translateY(-4px); 
      box-shadow: 0 12px 40px -8px rgba(10, 26, 63, 0.12), 0 8px 24px -4px rgba(62, 143, 255, 0.12); 
      border-color: rgba(62, 143, 255, 0.3);
    }
  `]
})
export class PostRideCardComponent {
  private feed = inject(ConnectFeedService);
  private router = inject(Router);
  private analytics = inject(AnalyticsService);
  private assistant = inject(AssistantService);
  private toast = inject(ToastService);
  @Input() post!: RidePost;
  @Output() opened = new EventEmitter<void>();

  like(){ this.feed.like(this.post.id); this.toast.info('Updated your like'); }
  save(){ const was = this.post.saved; this.feed.save(this.post.id); this.toast.success(was ? 'Removed from saved' : 'Saved ride'); }
  hide(){ this.feed.hide(this.post.id); this.toast.info('Ride hidden'); }
  report(){ this.feed.report(this.post.id); this.toast.warning('Ride reported'); }
  open(){ this.opened.emit(); this.analytics.postOpened(this.post.id, 'ride'); }
  openUber(){ window.open('https://m.uber.com/ul/', '_blank'); this.analytics.track('ride_uber_clicked', { id: this.post.id }); }
  askSetly(){ this.analytics.track('assistant_seed_from_post', { id: this.post.id, type: 'ride' }); this.assistant.onOpen(); this.assistant.sendUserMessage?.(`Help with ride ${this.post.from} to ${this.post.to}`); }

  navigateToDetail(): void {
    this.router.navigate(['/listing', this.post.id]);
  }
}
