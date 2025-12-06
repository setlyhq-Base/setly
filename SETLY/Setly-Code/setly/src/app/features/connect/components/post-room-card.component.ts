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
  <article class="card-premium hover-lift overflow-hidden unified-feed-card room-card" [attr.aria-label]="post.title" role="article" (mouseenter)="onHover(true)" (mouseleave)="onHover(false)">
      <header class="flex items-center justify-between p-5 border-b border-[#ECECEC]">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-[#3E8FFF] to-[#2D7FEF] text-white flex items-center justify-center text-sm font-semibold">{{post.authorId[0]}}</div>
          <div class="text-sm">
            <div class="font-semibold text-[#0A1A3F]">{{post.authorId}}</div>
            <div class="text-[#6F7785] flex items-center gap-2 text-xs">
              <span>{{post.city}}</span>
              <span>•</span>
              <span>{{post.createdAt | timeAgo}}</span>
              <span *ngIf="post.verifiedHost" class="inline-flex items-center gap-1 text-[#3E8FFF] text-xs px-2 py-0.5 rounded-full bg-[rgba(62,143,255,0.08)] border border-[rgba(62,143,255,0.2)]" aria-label="Verified host">
                <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 10-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                <span>Verified</span>
              </span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button type="button" (click)="askSetly()" class="text-xs px-3 py-1.5 border border-[#ECECEC] rounded-lg hover:border-[#3E8FFF] hover:text-[#3E8FFF] transition-colors font-medium" aria-label="Ask Setly about room">Ask Setly</button>
          <button type="button" (click)="hide()" class="text-xs px-3 py-1.5 border border-[#ECECEC] rounded-lg hover:border-[#6F7785] hover:text-[#6F7785] transition-colors font-medium" aria-label="Hide post">Hide</button>
        </div>
      </header>
      <div class="grid md:grid-cols-3 gap-5 p-5">
        <div class="md:col-span-2 relative">
          <img [src]="currentPhoto()" alt="{{post.title}}" class="w-full h-56 object-cover rounded-xl transition-opacity" loading="lazy">
          <!-- Carousel controls -->
          <button *ngIf="post.photos.length>1" class="absolute top-1/2 -translate-y-1/2 left-3 bg-white/90 backdrop-blur-sm text-[#0A1A3F] rounded-full w-8 h-8 flex items-center justify-center shadow-lg hover:bg-white transition-all" (click)="prevPhoto()" aria-label="Previous photo">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
          <button *ngIf="post.photos.length>1" class="absolute top-1/2 -translate-y-1/2 right-3 bg-white/90 backdrop-blur-sm text-[#0A1A3F] rounded-full w-8 h-8 flex items-center justify-center shadow-lg hover:bg-white transition-all" (click)="nextPhoto()" aria-label="Next photo">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
          <!-- Quick Peek overlay -->
          <div *ngIf="hover()" class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-4 text-white quick-peek rounded-xl">
            <div class="flex items-center justify-between mb-2">
              <span class="text-base font-semibold truncate" [title]="post.title">{{post.title}}</span>
              <span class="text-sm px-3 py-1 rounded-full bg-white/25 backdrop-blur-sm font-semibold" aria-label="Price">{{post.price}}</span>
            </div>
            <div class="flex items-center gap-2 text-xs opacity-95">
              <span class="inline-flex items-center gap-1" *ngIf="post.verifiedHost">
                <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 10-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                Verified host
              </span>
              <span>{{post.distanceKm}} km</span>
              <span>• {{post.city}}</span>
            </div>
            <div class="mt-3 flex gap-2">
              <button type="button" (click)="open()" class="px-4 py-2 rounded-lg text-xs bg-white text-[#0A1A3F] font-semibold hover:bg-white/95 transition-all" aria-label="Open room quick">Open</button>
              <button type="button" (click)="save()" class="px-4 py-2 rounded-lg text-xs bg-white/25 backdrop-blur-sm hover:bg-white/35 transition-all font-medium" aria-label="Save from quick peek">{{post.saved ? 'Saved' : 'Save'}}</button>
            </div>
          </div>
          <!-- Photo indicators -->
          <div *ngIf="post.photos.length>1" class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            <span *ngFor="let p of post.photos; let i=index" class="w-2 h-2 rounded-full transition-all" [class.bg-white]="i===photoIndex()" [class.w-6]="i===photoIndex()" [class.bg-white/40]="i!==photoIndex()"></span>
          </div>
        </div>
        <div class="space-y-3">
          <h3 class="text-lg font-semibold text-[#0A1A3F]">{{post.title}}</h3>
          <div class="text-sm text-[#6F7785] flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" stroke-width="1.5"/></svg>
            <span>{{post.city}} • {{post.distanceKm}} km</span>
          </div>
          <div class="text-2xl font-bold text-[#0A1A3F]">{{post.price}}<span class="text-sm font-normal text-[#6F7785]">/mo</span></div>
          <div class="flex flex-wrap gap-2 pt-2">
            <button type="button" (click)="like()" class="px-4 py-2 border border-[#ECECEC] rounded-lg text-sm font-medium hover:border-[#3E8FFF] hover:text-[#3E8FFF] transition-colors" aria-label="Like room">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" class="inline-block mr-1"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="currentColor" stroke-width="1.5"/></svg>
              {{post.likes || 0}}
            </button>
            <button type="button" (click)="save()" class="px-4 py-2 border rounded-lg text-sm font-medium transition-colors" [class.border-[#3E8FFF]]="post.saved" [class.text-[#3E8FFF]]="post.saved" [class.bg-[rgba(62,143,255,0.05)]]="post.saved" [class.border-[#ECECEC]]="!post.saved" [class.hover:border-[#3E8FFF]]="!post.saved" aria-label="Save room">{{post.saved ? 'Saved' : 'Save'}}</button>
            <button type="button" (click)="open()" class="px-4 py-2 bg-[#3E8FFF] text-white rounded-lg text-sm font-semibold hover:bg-[#2D7FEF] transition-colors shadow-md" aria-label="Open room">Open</button>
          </div>
          <div class="pt-2">
            <a [routerLink]="['/messages']" [queryParams]="{ with: post.hostId, listing: post.roomId }" class="text-sm text-[#3E8FFF] hover:underline font-medium inline-flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" stroke-width="1.5"/></svg>
              Chat with Host
            </a>
          </div>
        </div>
      </div>
    </article>
  `
  ,
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
    .room-card { position: relative; }
    .quick-peek { opacity:0; transform: translateY(6px); transition: opacity 200ms ease, transform 200ms ease; }
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
