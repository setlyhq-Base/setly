import { Component, EventEmitter, Input, Output, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PersonPost } from '../models/connect.models';
import { ConnectFeedService } from '../../../core/services/connect-feed.service';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { ToastService } from '../../../core/services/toast.service';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';

@Component({
  selector: 'app-post-person-card',
  standalone: true,
  imports: [CommonModule, TimeAgoPipe],
  template: `
  <article class="card-white hover-lift overflow-hidden transition-shadow unified-feed-card" role="article" [attr.aria-label]="post.name" (mouseenter)="hover.set(true)" (mouseleave)="hover.set(false)" [class.shadow-glow-blue]="hover()">
    <header class="flex items-center justify-between p-4 border-b border-gray-100">
      <div class="flex items-center gap-3">
        <span class="relative inline-block">
          <img *ngIf="post.avatarUrl; else init" [src]="post.avatarUrl" alt="{{post.name}} avatar" class="w-10 h-10 rounded-full object-cover border" loading="lazy" decoding="async" fetchpriority="low"/>
          <ng-template #init>
            <div class="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">{{ post.name[0] || 'S' }}</div>
          </ng-template>
          <span *ngIf="post.presence==='online'" class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-white" aria-label="Online"></span>
        </span>
        <div class="leading-tight">
          <div class="font-medium text-gray-900">{{post.name}}</div>
          <div class="text-xs text-gray-600 flex items-center gap-2">
            <span *ngIf="post.university">{{post.university}}</span>
            <span *ngIf="post.company">• {{post.company}}</span>
            <span>• {{post.createdAt | timeAgo}}</span>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button (click)="hide()" class="text-xs px-2 py-1 border rounded focus-ring" aria-label="Hide person">Hide</button>
        <button (click)="report()" class="text-xs px-2 py-1 border rounded text-red-600 focus-ring" aria-label="Report person">Report</button>
      </div>
    </header>
    <div class="p-4 flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2 text-xs text-gray-600 flex-wrap">
          <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border" [class.text-green-700]="post.verified.email" [class.bg-green-50]="post.verified.email" [class.border-green-200]="post.verified.email">Email</span>
          <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border" [class.text-green-700]="post.verified.phone" [class.bg-green-50]="post.verified.phone" [class.border-green-200]="post.verified.phone">Phone</span>
          <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border" [class.text-green-700]="post.verified.university" [class.bg-green-50]="post.verified.university" [class.border-green-200]="post.verified.university">University</span>
          <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border" [class.text-green-700]="post.verified.photo" [class.bg-green-50]="post.verified.photo" [class.border-green-200]="post.verified.photo">Photo</span>
          <span *ngIf="post.mutuals" class="ml-2 text-gray-500">{{post.mutuals}} mutuals</span>
        </div>
        <div class="flex items-center gap-2">
          <button *ngIf="!connected()" (click)="connect()" class="btn-brand px-3 py-2 rounded-md text-sm focus-ring" aria-label="Connect">Connect</button>
          <button *ngIf="connected()" (click)="message()" class="px-3 py-2 border rounded-md text-sm focus-ring inline-flex items-center gap-1" aria-label="Message">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 5h16v10H5.17L4 16.17V5z" stroke="#5A4FF3" stroke-width="1.3"/><circle cx="9" cy="10" r="1" fill="#5A4FF3"/><circle cx="12" cy="10" r="1" fill="#5A4FF3"/><circle cx="15" cy="10" r="1" fill="#5A4FF3"/></svg>
            <span>Message</span>
          </button>
        </div>
      </div>
      <!-- Interests chips (mock for now) -->
      <div class="flex flex-wrap gap-2">
        <span *ngFor="let interest of interests()" class="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] border border-indigo-200">{{interest}}</span>
      </div>
      <div *ngIf="connected()" class="text-[11px] text-green-700 inline-flex items-center gap-1" aria-label="Connected status">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 12l2 2 4-4" stroke="#16A34A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Connected • Start a chat
      </div>
    </div>
  </article>
  `
  ,
  styles: [`
    .shadow-glow-blue { box-shadow: 0 0 0 1px rgba(90,79,243,0.2), 0 8px 20px -6px rgba(90,79,243,0.25); }
  `]
})
export class PostPersonCardComponent implements OnInit {
  private feed = inject(ConnectFeedService);
  private analytics = inject(AnalyticsService);
  private toast = inject(ToastService);

  @Input() post!: PersonPost;
  @Output() opened = new EventEmitter<void>();
  hover = signal(false);
  connected = signal(false);
  interests = signal<string[]>([]);

  ngOnInit(){
    // Derive mock interests from tags/university
    const base: string[] = [];
    if (this.post.university) base.push(this.post.university.split(' ')[0]);
    if (this.post.company) base.push('Work');
    (this.post as any).tags?.forEach((t: string) => base.push(t));
    if (!base.length) base.push('Community');
    this.interests.set(Array.from(new Set(base)).slice(0,4));
  }

  connect(){
    this.connected.set(true);
    this.toast.success('Connected ✔');
    this.analytics.track('person_connect_clicked', { id: this.post.id });
  }
  message(){ this.toast.info('Opening chat'); this.analytics.track('person_message_clicked', { id: this.post.id }); }
  hide(){ this.feed.hide(this.post.id); this.toast.info('Person hidden'); }
  report(){ this.feed.report(this.post.id); this.toast.warning('Reported'); }
}
