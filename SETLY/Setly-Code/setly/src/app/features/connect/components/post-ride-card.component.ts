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
  <article class="card-white hover-lift overflow-hidden unified-feed-card" [attr.aria-label]="post.from + ' to ' + post.to" role="article">
      <header class="flex items-center justify-between p-4 border-b border-gray-100">
        <div class="flex items-center gap-3">
          <div class="relative">
            <div class="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center text-xs" [attr.aria-label]="'Driver ' + post.authorId">{{post.authorId[0]}}</div>
            <span *ngIf="post.presence==='online'" class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-white" aria-label="Active now"></span>
          </div>
          <div class="text-sm leading-tight">
            <div class="font-medium text-gray-900 flex items-center gap-1">
              <span>{{post.authorId}}</span>
              <span *ngIf="post.driverVerified" class="text-[11px] px-1.5 py-0.5 rounded-full border border-green-300 text-green-700 inline-flex items-center gap-1" aria-label="Verified driver">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 12l2 2 4-4" stroke="#16A34A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                Verified
              </span>
            </div>
            <div class="text-gray-500">{{post.createdAt | timeAgo}}</div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button type="button" (click)="askSetly()" class="text-xs px-2 py-1 border rounded focus-ring" aria-label="Ask Setly about ride">Ask Setly</button>
          <button type="button" (click)="hide()" class="text-xs px-2 py-1 border rounded focus-ring" aria-label="Hide ride">Hide</button>
          <button type="button" (click)="report()" class="text-xs px-2 py-1 border rounded text-red-600 focus-ring" aria-label="Report ride">Report</button>
        </div>
      </header>
      <div class="p-4 space-y-3">
        <div class="flex flex-wrap items-center gap-2" aria-label="Route">
          <span class="px-2 py-0.5 rounded-full border text-xs bg-gray-50" aria-label="From">{{post.from}}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7" stroke="#6B7280" stroke-width="1.5" stroke-linecap="round"/></svg>
          <span class="px-2 py-0.5 rounded-full border text-xs bg-gray-50" aria-label="To">{{post.to}}</span>
          <span class="ml-auto text-xs px-2 py-0.5 rounded-full border" [class.border-green-300]="post.seats && post.seats>1" [class.text-green-700]="post.seats && post.seats>1">{{post.seats || 1}} seat{{(post.seats||1)>1 ? 's' : ''}} left</span>
        </div>
        <div class="text-sm text-gray-600">
          <span class="inline-flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 8h12M6 12h8M6 16h10" stroke="#6B7280" stroke-width="1.5"/></svg>
            {{post.when | date:'short'}}
          </span>
          <span *ngIf="post.isSetlyRide" class="ml-2 inline-flex items-center gap-1 text-indigo-700 text-xs px-1.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200" aria-label="SetlyRide">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 12l2-5h14l2 5v5H3v-5z" stroke="#5A4FF3" stroke-width="1.5"/><circle cx="7.5" cy="17" r="1.5" fill="#5A4FF3"/><circle cx="16.5" cy="17" r="1.5" fill="#5A4FF3"/></svg>
            SetlyRide
          </span>
          <span *ngIf="post.mutualsJoined" class="ml-2 inline-flex items-center gap-1 text-xs text-gray-600" aria-label="Mutuals joined">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 7a3 3 0 116 0 3 3 0 01-6 0zm-3 9a5 5 0 0110 0v2H4v-2zM15 12a3 3 0 016 0 3 3 0 01-6 0zm-1 6v-1a5 5 0 016 0v1h-6z" stroke="#6B7280" stroke-width="1"/></svg>
            {{post.mutualsJoined}} mutual{{post.mutualsJoined>1?'s':''}} joined
          </span>
        </div>
        <div class="flex flex-wrap gap-2 pt-1">
          <button type="button" (click)="like()" class="px-3 py-2 border rounded-md text-sm focus-ring" aria-label="Like ride">Like {{post.likes || 0}}</button>
          <button type="button" (click)="save()" class="px-3 py-2 border rounded-md text-sm focus-ring" [class.btn-brand]="post.saved" aria-label="Save ride">{{post.saved ? 'Saved' : 'Save'}}</button>
          <button type="button" (click)="openUber()" class="px-3 py-2 border rounded-md text-sm focus-ring" aria-label="Open in Uber">Open Uber</button>
          <button type="button" (click)="open()" class="btn-brand px-3 py-2 rounded-md text-sm focus-ring" aria-label="Request SetlyRide">Request Ride</button>
        </div>
        <div class="pt-1">
          <a [routerLink]="['/messages']" [queryParams]="{ with: post.hostId, listing: post.id }" class="text-sm text-blue-600 hover:underline">Chat with Driver</a>
        </div>
      </div>
    </article>
  `
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
}
