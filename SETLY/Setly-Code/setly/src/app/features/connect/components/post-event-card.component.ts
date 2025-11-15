import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventPost } from '../models/connect.models';
import { ConnectFeedService } from '../../../core/services/connect-feed.service';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { AssistantService } from '../../assistant/assistant.service';
import { ToastService } from '../../../core/services/toast.service';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';

@Component({
  selector: 'app-post-event-card',
  standalone: true,
  imports: [CommonModule, TimeAgoPipe],
  template: `
  <article class="card-white hover-lift overflow-hidden unified-feed-card" role="article" [attr.aria-label]="post.name">
      <header class="flex items-center justify-between p-4 border-b border-gray-100">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs">{{post.authorId[0]}}</div>
          <div class="text-sm">
            <div class="font-medium text-gray-900">{{post.authorId}}</div>
            <div class="text-gray-500">{{post.createdAt | timeAgo}}</div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button type="button" (click)="askSetly()" class="text-xs px-2 py-1 border rounded focus-ring" aria-label="Ask Setly about event">Ask Setly</button>
          <button type="button" (click)="hide()" class="text-xs px-2 py-1 border rounded focus-ring" aria-label="Hide event">Hide</button>
          <button type="button" (click)="report()" class="text-xs px-2 py-1 border rounded text-red-600 focus-ring" aria-label="Report event">Report</button>
        </div>
      </header>
      <div class="grid md:grid-cols-3 gap-4 p-4">
        <div class="md:col-span-2">
          <img [src]="post.cover || '/assets/boston.jpg'" [alt]="post.name" class="w-full h-48 object-cover rounded-md" loading="lazy">
        </div>
        <div class="space-y-2">
          <h3 class="text-lg font-medium text-gray-900">{{post.name}}</h3>
          <div class="text-sm text-gray-600">{{post.when | date:'short'}} • {{post.where}}</div>
          <div class="flex gap-2 pt-2">
            <button type="button" (click)="like()" class="px-3 py-2 border rounded-md text-sm focus-ring" aria-label="Like event">Like {{post.likes || 0}}</button>
            <button type="button" (click)="save()" class="px-3 py-2 border rounded-md text-sm focus-ring" [class.btn-brand]="post.saved" aria-label="Save event">{{post.saved ? 'Saved' : 'Save'}}</button>
            <button type="button" (click)="open()" class="btn-brand px-3 py-2 rounded-md text-sm focus-ring" aria-label="I'm going button">I'm going</button>
          </div>
        </div>
      </div>
    </article>
  `
})
export class PostEventCardComponent {
  private feed = inject(ConnectFeedService);
  private analytics = inject(AnalyticsService);
  private assistant = inject(AssistantService);
  private toast = inject(ToastService);
  @Input() post!: EventPost;
  @Output() opened = new EventEmitter<void>();

  like(){ this.feed.like(this.post.id); this.toast.info('Updated your like'); }
  save(){ const was = this.post.saved; this.feed.save(this.post.id); this.toast.success(was ? 'Removed from saved' : 'Saved event'); }
  hide(){ this.feed.hide(this.post.id); this.toast.info('Event hidden'); }
  report(){ this.feed.report(this.post.id); this.toast.warning('Event reported'); }
  open(){ this.opened.emit(); this.analytics.postOpened(this.post.id, 'event'); }
  askSetly(){ this.analytics.track('assistant_seed_from_post', { id: this.post.id, type: 'event' }); this.assistant.onOpen(); this.assistant.sendUserMessage?.(`Tell me about event ${this.post.name}`); }
}
