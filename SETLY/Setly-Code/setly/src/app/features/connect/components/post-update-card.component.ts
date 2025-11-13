import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UpdatePost } from '../models/connect.models';
import { ConnectFeedService } from '../../../core/services/connect-feed.service';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { AssistantService } from '../../assistant/assistant.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-post-update-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="card-white hover-lift overflow-hidden" role="article" [attr.aria-label]="post.headline">
      <div class="p-4">
        <div class="text-xs uppercase tracking-wide text-gray-500 mb-1">Setly Update</div>
        <h3 class="text-lg font-medium text-gray-900">{{post.headline}}</h3>
        <p class="text-sm text-gray-700" *ngIf="post.body">{{post.body}}</p>
        <div class="flex gap-2 pt-2">
          <button type="button" (click)="like()" class="px-3 py-2 border rounded-md text-sm focus-ring" aria-label="Like update">Like {{post.likes || 0}}</button>
          <button type="button" (click)="save()" class="px-3 py-2 border rounded-md text-sm focus-ring" [class.btn-brand]="post.saved" aria-label="Save update">{{post.saved ? 'Saved' : 'Save'}}</button>
          <button type="button" (click)="open()" class="btn-brand px-3 py-2 rounded-md text-sm focus-ring" aria-label="Open update">Open</button>
          <button type="button" (click)="hide()" class="px-3 py-2 border rounded-md text-sm focus-ring" aria-label="Hide update">Hide</button>
          <button type="button" (click)="report()" class="px-3 py-2 border rounded-md text-sm text-red-600 focus-ring" aria-label="Report update">Report</button>
        </div>
      </div>
    </article>
  `
})
export class PostUpdateCardComponent {
  private feed = inject(ConnectFeedService);
  private analytics = inject(AnalyticsService);
  private assistant = inject(AssistantService);
  private toast = inject(ToastService);
  @Input() post!: UpdatePost;
  @Output() opened = new EventEmitter<void>();

  like(){ this.feed.like(this.post.id); this.toast.info('Updated your like'); }
  save(){ const was = this.post.saved; this.feed.save(this.post.id); this.toast.success(was ? 'Removed from saved' : 'Saved update'); }
  hide(){ this.feed.hide(this.post.id); this.toast.info('Update hidden'); }
  report(){ this.feed.report(this.post.id); this.toast.warning('Update reported'); }
  open(){ this.opened.emit(); this.analytics.postOpened(this.post.id, 'update'); this.assistant.onOpen(); this.assistant.sendUserMessage?.(`What's new: ${this.post.headline}`); }
}
