import { Component, Input, OnDestroy, OnInit, Signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PeopleDirectoryService, DirectoryUser } from '../../../core/services/people-directory.service';
import { PresenceService } from '../../../core/services/presence.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-people-directory',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <section aria-label="Setly People directory">
    <div class="mb-3 flex items-center justify-between">
      <h2 class="text-base font-semibold text-gray-800">People</h2>
      <div class="text-sm text-gray-500" *ngIf="users().length">{{ users().length }} shown</div>
    </div>
    <div class="mb-3 text-sm text-red-600" *ngIf="error() && !loading()">
      {{ error() }}
    </div>
    <div class="grid gap-4" [class.md:grid-cols-2]="true" [class.lg:grid-cols-3]="true" [class.xl:grid-cols-4]="true">
      <a *ngFor="let u of users()" class="card-white p-4 flex items-center gap-3 hover:shadow transition" [routerLink]="['/profile', u.id]" [attr.aria-label]="'View profile for ' + u.name">
        <span class="relative inline-block">
          <img *ngIf="u.avatarUrl; else init" [src]="u.avatarUrl" alt="{{u.name}} avatar" class="w-12 h-12 rounded-full object-cover border" loading="lazy"/>
          <ng-template #init>
            <div class="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center">{{ (u.name||'S').slice(0,1) }}</div>
          </ng-template>
          <span *ngIf="isOnline(u.id)" class="absolute -bottom-0.5 -right-0.5 block w-3 h-3 rounded-full ring-2 ring-white bg-green-500" title="Online"></span>
        </span>
        <div class="min-w-0">
          <div class="font-medium text-gray-900 truncate">{{u.name}}</div>
          <div class="text-xs text-gray-600 truncate">
            <span *ngIf="u.universityId">{{u.universityId}}</span>
            <span *ngIf="u.location">• {{u.location}}</span>
          </div>
          <div class="text-[11px] text-gray-500" *ngIf="u.lastSeen" [title]="formatLocal(u.lastSeen)">Active {{ timeAgo(u.lastSeen) }} · {{ formatLocal(u.lastSeen) }}</div>
          <div class="mt-1 flex items-center gap-1.5 text-[11px] text-gray-600 flex-wrap">
            <span class="px-1.5 py-0.5 rounded-full border" [class.text-green-700]="u.badges.email" [class.bg-green-50]="u.badges.email" [class.border-green-200]="u.badges.email">Email</span>
            <span class="px-1.5 py-0.5 rounded-full border" [class.text-green-700]="u.badges.phone" [class.bg-green-50]="u.badges.phone" [class.border-green-200]="u.badges.phone">Phone</span>
            <span class="px-1.5 py-0.5 rounded-full border" [class.text-green-700]="u.badges.university" [class.bg-green-50]="u.badges.university" [class.border-green-200]="u.badges.university">University</span>
            <span class="px-1.5 py-0.5 rounded-full border" [class.text-green-700]="u.badges.photo" [class.bg-green-50]="u.badges.photo" [class.border-green-200]="u.badges.photo">Photo</span>
          </div>
        </div>
      </a>
    </div>
    <div class="mt-4 flex items-center justify-center" *ngIf="loading()">
      <span class="text-sm text-gray-500">Loading…</span>
    </div>
    <div class="mt-4 flex items-center justify-center" *ngIf="!loading() && nextCursor()">
      <button (click)="loadMore()" class="px-3 py-1.5 border rounded-md text-sm focus-ring">Load more</button>
    </div>
  </section>
  `
})
export class PeopleDirectoryComponent implements OnInit, OnDestroy {
  private service = inject(PeopleDirectoryService);
  private presence = inject(PresenceService);

  users: Signal<DirectoryUser[]> = this.service.users;
  loading = this.service.loading;
  nextCursor = this.service.nextCursor;
  error = this.service.error;

  @Input() includeIncomplete = true;
  private pollHandle: any;
  private presenceHandle: any;

  ngOnInit(): void {
    this.service.reset();
    this.service.list({ includeIncomplete: this.includeIncomplete });
    this.pollHandle = setInterval(() => {
      // Refresh first page to pick up new users dynamically
      this.service.list({ includeIncomplete: this.includeIncomplete });
    }, 30000);

    // Poll presence
    this.presence.fetchOnline();
    this.presenceHandle = setInterval(() => this.presence.fetchOnline(), 15000);
  }

  loadMore() { this.service.loadMore(); }

  ngOnDestroy(): void {
    try { clearInterval(this.pollHandle); } catch {}
    try { clearInterval(this.presenceHandle); } catch {}
  }

  isOnline(uid: string): boolean {
    return this.presence.online().has(uid);
  }

  timeAgo(iso: string): string {
    const ts = Date.parse(iso);
    if (!ts) return 'recently';
    const diff = Math.max(0, Date.now() - ts);
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return 'just now';
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min} min${min>1?'s':''} ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr} hour${hr>1?'s':''} ago`;
    const day = Math.floor(hr / 24);
    return `${day} day${day>1?'s':''} ago`;
  }

  formatLocal(iso: string): string {
    try {
      const dt = new Date(iso);
      // Use browser locale and time zone
      return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(dt);
    } catch {
      return iso;
    }
  }
}
