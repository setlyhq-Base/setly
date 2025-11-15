import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThreadPost } from '../models/connect.models';
import { ConnectFeedService } from '../../../core/services/connect-feed.service';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { AssistantService } from '../../assistant/assistant.service';
import { ToastService } from '../../../core/services/toast.service';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';

@Component({
  selector: 'app-post-thread-card',
  standalone: true,
  imports: [CommonModule, TimeAgoPipe],
  template: `
  <article class="card-white hover-lift overflow-hidden unified-feed-card" role="article" [attr.aria-label]="post.title">
      <header class="flex items-center justify-between p-4 border-b border-gray-100">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs">{{post.authorId[0]}}</div>
          <div class="text-sm">
            <div class="font-medium text-gray-900">{{post.authorId}}</div>
            <div class="text-gray-500">{{post.topic | titlecase}} • {{post.createdAt | timeAgo}}</div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button (click)="askSetly()" class="text-xs px-2 py-1 border rounded" aria-label="Ask Setly about thread">Ask Setly</button>
          <button (click)="hide()" class="text-xs px-2 py-1 border rounded" aria-label="Hide thread">Hide</button>
          <button (click)="report()" class="text-xs px-2 py-1 border rounded text-red-600" aria-label="Report thread">Report</button>
        </div>
      </header>
      <div class="p-4 space-y-2">
        <h3 class="text-lg font-medium text-gray-900">{{post.title}}</h3>
        <p class="text-sm text-gray-700 line-clamp-3">{{post.excerpt}}</p>
        <div class="flex gap-2 pt-2">
          <button type="button" (click)="like()" class="px-3 py-2 border rounded-md text-sm focus-ring" aria-label="Like thread">Like {{post.likes || 0}}</button>
          <button type="button" (click)="save()" class="px-3 py-2 border rounded-md text-sm focus-ring" [class.btn-brand]="post.saved" aria-label="Save thread">{{post.saved ? 'Saved' : 'Save'}}</button>
          <button type="button" (click)="open()" class="btn-brand px-3 py-2 rounded-md text-sm focus-ring" aria-label="Open thread">Open thread</button>
        </div>
      </div>
    </article>
  `
})
export class PostThreadCardComponent {
  private feed = inject(ConnectFeedService);
  private analytics = inject(AnalyticsService);
  private assistant = inject(AssistantService);
  private toast = inject(ToastService);
  @Input() post!: ThreadPost;
  @Output() opened = new EventEmitter<void>();

  like(){ this.feed.like(this.post.id); this.toast.info('Updated your like'); }
  save(){ const was = this.post.saved; this.feed.save(this.post.id); this.toast.success(was ? 'Removed from saved' : 'Saved thread'); }
  hide(){ this.feed.hide(this.post.id); this.toast.info('Thread hidden'); }
  report(){ this.feed.report(this.post.id); this.toast.warning('Thread reported'); }
  open(){ this.opened.emit(); this.analytics.postOpened(this.post.id, 'thread'); }
  askSetly(){ this.analytics.track('assistant_seed_from_post', { id: this.post.id, type: 'thread' }); this.assistant.onOpen(); this.assistant.sendUserMessage?.(`Open thread: ${this.post.title}`); }
}
