import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarketPost } from '../models/connect.models';
import { MarketDmDrawerComponent } from './market-dm-drawer.component';
import { ToastService } from '../../../core/services/toast.service';
import { ConnectFeedService } from '../../../core/services/connect-feed.service';

@Component({
  selector: 'app-post-market-card',
  standalone: true,
  imports: [CommonModule, MarketDmDrawerComponent],
  template: `
  <article class="market-card card-white hover-lift overflow-hidden unified-feed-card group" role="article" [attr.aria-label]="post.title">
    <div class="relative">
      <img [src]="post.images[0]" alt="{{post.title}}" class="w-full h-44 object-cover" loading="lazy" />
      <div class="absolute bottom-2 left-2 text-white bg-black/50 rounded px-2 py-0.5 text-sm">$ {{post.price}}</div>
    </div>
    <div class="p-3">
      <div class="text-sm font-medium truncate" [title]="post.title">{{post.title}}</div>
      <div class="text-xs text-gray-600 flex items-center gap-2 mt-1">
        <span>{{post.location}}</span>
        <span *ngIf="post.verifiedSeller" class="inline-flex items-center gap-1 text-green-700 bg-green-50 border border-green-200 rounded px-1 py-0.5">Verified</span>
      </div>
      <div class="mt-2 flex items-center gap-2">
        <button class="px-2 py-1 border rounded text-xs" (click)="save()" aria-label="Save item">{{ saved() ? 'Saved' : 'Save' }}</button>
        <button class="px-2 py-1 btn-brand rounded text-xs" (click)="message()" aria-label="Message seller">Message Seller</button>
      </div>
    </div>
  </article>
  <app-market-dm-drawer [open]="drawerOpen()" [post]="post" (closed)="drawerOpen.set(false)"></app-market-dm-drawer>
  `,
  styles: [`
    .market-card { width: 100%; }
  `]
})
export class PostMarketCardComponent {
  @Input() post!: MarketPost;
  @Output() opened = new EventEmitter<void>();
  drawerOpen = signal(false);
  private toast = inject(ToastService);
  private feed = inject(ConnectFeedService);

  saved(){ return !!this.post?.saved; }
  save(){
    this.feed.save(this.post.id);
    const next = !this.post.saved;
    // Optimistic UI: mirror the change on local input object for button label
    this.post = { ...this.post, saved: next } as MarketPost;
    this.toast.success(next ? 'Saved item' : 'Removed from saved');
  }
  message(){ this.drawerOpen.set(true); }
}
