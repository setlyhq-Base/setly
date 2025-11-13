import { Component, EventEmitter, Input, Output, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomPost } from '../models/connect.models';
import { ConnectFeedService } from '../../../core/services/connect-feed.service';
import { Router, RouterModule } from '@angular/router';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { AssistantService } from '../../assistant/assistant.service';
import { ToastService } from '../../../core/services/toast.service';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';

@Component({
  selector: 'app-post-room-card',
  standalone: true,
  imports: [CommonModule, RouterModule, TimeAgoPipe],
  template: `
  <article class="card-white hover-lift overflow-hidden room-card" [attr.aria-label]="post.title" role="article" (mouseenter)="onHover(true)" (mouseleave)="onHover(false)">
      <header class="flex items-center justify-between p-4 border-b border-gray-100">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs">{{post.authorId[0]}}</div>
          <div class="text-sm">
            <div class="font-medium text-gray-900">{{post.authorId}}</div>
            <div class="text-gray-500 flex items-center gap-2">
              <span>{{post.city}}</span>
              <span>•</span>
              <span>{{post.createdAt | timeAgo}}</span>
              <span *ngIf="post.verifiedHost" class="inline-flex items-center gap-1 text-green-600 text-xs px-1.5 py-0.5 rounded-full bg-green-50 border border-green-200" aria-label="Verified host">
                <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 10-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                <span>Verified</span>
              </span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button type="button" (click)="askSetly()" class="text-xs px-2 py-1 border rounded focus-ring" aria-label="Ask Setly about room">Ask Setly</button>
          <button type="button" (click)="hide()" class="text-xs px-2 py-1 border rounded focus-ring" aria-label="Hide post">Hide</button>
          <button type="button" (click)="report()" class="text-xs px-2 py-1 border rounded text-red-600 focus-ring" aria-label="Report post">Report</button>
        </div>
      </header>
      <div class="grid md:grid-cols-3 gap-4 p-4">
        <div class="md:col-span-2 relative">
          <img [src]="currentPhoto()" alt="{{post.title}}" class="w-full h-48 object-cover rounded-md transition-opacity" loading="lazy">
          <!-- Carousel controls -->
          <button *ngIf="post.photos.length>1" class="absolute top-1/2 -translate-y-1/2 left-2 bg-black/40 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs" (click)="prevPhoto()" aria-label="Previous photo">‹</button>
          <button *ngIf="post.photos.length>1" class="absolute top-1/2 -translate-y-1/2 right-2 bg-black/40 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs" (click)="nextPhoto()" aria-label="Next photo">›</button>
          <!-- Quick Peek overlay -->
          <div *ngIf="hover()" class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent flex flex-col justify-end p-3 text-white quick-peek">
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm font-medium truncate" [title]="post.title">{{post.title}}</span>
              <span class="text-xs px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm" aria-label="Price">$ {{post.price}}</span>
            </div>
            <div class="flex items-center gap-2 text-[11px] opacity-90">
              <span class="inline-flex items-center gap-1" *ngIf="post.verifiedHost">
                <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 10-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                Verified host
              </span>
              <span>{{post.distanceKm}} km</span>
              <span>• {{post.city}}</span>
            </div>
            <div class="mt-2 flex gap-2">
              <button type="button" (click)="open()" class="px-2 py-1 rounded-md text-[11px] bg-white/90 text-gray-800 font-medium" aria-label="Open room quick">Open</button>
              <button type="button" (click)="save()" class="px-2 py-1 rounded-md text-[11px] bg-white/20 backdrop-blur-sm" aria-label="Save from quick peek">{{post.saved ? 'Saved' : 'Save'}}</button>
            </div>
          </div>
          <!-- Photo indicators -->
          <div *ngIf="post.photos.length>1" class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            <span *ngFor="let p of post.photos; let i=index" class="w-2 h-2 rounded-full" [class.bg-white]="i===photoIndex()" [class.bg-white/40]="i!==photoIndex()"></span>
          </div>
        </div>
        <div class="space-y-2">
          <h3 class="text-lg font-medium text-gray-900">{{post.title}}</h3>
          <div class="text-sm text-gray-600">{{post.city}} • {{post.distanceKm}} km</div>
          <div class="text-xl font-semibold">$ {{post.price}}</div>
          <div class="flex gap-2 pt-2">
            <button type="button" (click)="like()" class="px-3 py-2 border rounded-md text-sm focus-ring" aria-label="Like room">Like {{post.likes || 0}}</button>
            <button type="button" (click)="save()" class="px-3 py-2 border rounded-md text-sm focus-ring" [class.btn-brand]="post.saved" aria-label="Save room">{{post.saved ? 'Saved' : 'Save'}}</button>
            <button type="button" (click)="open()" class="btn-brand px-3 py-2 rounded-md text-sm focus-ring" aria-label="Open room">Open</button>
          </div>
          <div class="pt-2">
            <a [routerLink]="['/messages']" [queryParams]="{ with: post.hostId, listing: post.roomId }" class="text-sm text-blue-600 hover:underline">Chat with Host</a>
          </div>
        </div>
      </div>
    </article>
  `
  ,
  styles: [`
    .room-card { position: relative; }
    .quick-peek { opacity:0; transform: translateY(6px); transition: opacity 180ms ease, transform 180ms ease; }
    .room-card:hover .quick-peek { opacity:1; transform: translateY(0); }
  `]
})
export class PostRoomCardComponent implements OnInit {
  private feed = inject(ConnectFeedService);
  private router = inject(Router);
  private analytics = inject(AnalyticsService);
  private assistant = inject(AssistantService);
  private toast = inject(ToastService);

  @Input() post!: RoomPost;
  @Output() opened = new EventEmitter<void>();

  hover = signal(false);
  photoIndex = signal(0);
  intervalHandle: any;
  currentPhoto = () => this.post.photos[this.photoIndex()] || this.post.photos[0];

  ngOnInit(){
    // Preload next photos for smoother hover transitions
    this.post.photos.slice(1).forEach(src => { const img = new Image(); img.src = src; });
  }

  onHover(state: boolean){
    this.hover.set(state);
    if (state && this.post.photos.length>1) {
      this.startAutoRotate();
    } else {
      this.stopAutoRotate();
    }
  }
  startAutoRotate(){ this.stopAutoRotate(); this.intervalHandle = setInterval(() => this.nextPhoto(true), 2800); }
  stopAutoRotate(){ if (this.intervalHandle){ clearInterval(this.intervalHandle); this.intervalHandle=null; } }
  nextPhoto(auto=false){
    const next = (this.photoIndex()+1) % this.post.photos.length;
    this.photoIndex.set(next);
    if(!auto) this.analytics.track('room_photo_next_clicked', { id: this.post.id, index: next });
  }
  prevPhoto(){
    const prev = (this.photoIndex()-1 + this.post.photos.length) % this.post.photos.length;
    this.photoIndex.set(prev);
    this.analytics.track('room_photo_prev_clicked', { id: this.post.id, index: prev });
  }

  like(){ this.feed.like(this.post.id); this.toast.info('Updated your like'); }
  save(){ const wasSaved = this.post.saved; this.feed.save(this.post.id); this.toast.success(wasSaved ? 'Removed from saved' : 'Saved post'); }
  hide(){ this.feed.hide(this.post.id); this.toast.info('Post hidden'); }
  report(){ this.feed.report(this.post.id); this.toast.warning('Reported. Thanks for the feedback.'); }
  open(){ this.opened.emit(); this.analytics.postOpened(this.post.id, 'room'); this.router.navigate(['/listing', this.post.roomId]); }
  askSetly(){
    this.analytics.track('assistant_seed_from_post', { id: this.post.id, type: 'room' });
    this.assistant.onOpen();
    this.assistant.sendUserMessage?.(`Tell me about room ${this.post.roomId}`);
  }
}
