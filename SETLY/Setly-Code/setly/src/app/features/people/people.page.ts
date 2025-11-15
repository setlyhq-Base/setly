import { CommonModule } from '@angular/common';
import { Component, Signal, computed, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PeopleDirectoryService, DirectoryUser } from '../../core/services/people-directory.service';
import { PeopleFilters, PeopleFiltersPanelComponent } from './components/people-filters-panel.component';

@Component({
  selector: 'app-people-page',
  standalone: true,
  imports: [CommonModule, RouterModule, PeopleFiltersPanelComponent],
  template: `
  <div class="min-h-screen bg-white text-gray-900" aria-label="People directory page">
    <!-- Header Area -->
    <section class="border-b border-gray-100">
      <div class="mx-auto max-w-[1400px] px-6 py-8 flex items-start justify-between gap-6">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">People on Setly</h1>
          <p class="text-gray-600 mt-1">Explore all members of the Setly community.</p>
        </div>
        <div class="text-right ml-auto">
          <div class="text-sm text-gray-700">Total Setlies: <span class="font-semibold">{{ totalCount() | number }}</span></div>
          <div class="mt-2 flex items-center gap-2 justify-end">
            <button class="px-3 py-1.5 border rounded-md text-sm" (click)="invite()">Invite friends</button>
            <label class="text-sm text-gray-600">Sort</label>
            <select class="text-sm border rounded-md px-2 py-1" [value]="filters().sort" (change)="onSort($event)">
              <option value="recent">Recently Joined</option>
              <option value="alpha">Alphabetical (A–Z)</option>
              <option value="university">By University</option>
              <option value="location">By Location</option>
            </select>
          </div>
        </div>
      </div>
    </section>

    <!-- Main layout -->
    <div class="mx-auto max-w-[1400px] px-6 py-8 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
      <!-- Left Filters -->
      <aside class="sticky self-start top-[calc(var(--header-height,64px)+24px)]">
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
          <app-people-filters-panel (changed)="apply($event)"></app-people-filters-panel>
        </div>
      </aside>

      <!-- Right Grid -->
      <main>
        <div *ngIf="filtered().length === 0 && !loading()" class="text-center py-16 border rounded-2xl">
          <img src="/assets/empty-state.svg" alt="Empty" class="mx-auto w-32 h-32 opacity-70 mb-4"/>
          <h3 class="text-lg font-semibold mb-1">No Setlies match your filters.</h3>
          <p class="text-gray-600 mb-3">Try clearing filters to see more people.</p>
          <button class="px-3 py-1.5 border rounded-md text-sm" (click)="clear()">Clear filters</button>
        </div>

        <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3" [class.animate-fade-in]="animate()">
          <a *ngFor="let u of filtered()" [routerLink]="['/profile', u.id]" class="block bg-white rounded-2xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition" [attr.aria-label]="'View profile ' + u.name">
            <div class="flex items-center gap-3">
              <span class="relative inline-block">
                <img *ngIf="u.avatarUrl; else init" [src]="u.avatarUrl" alt="{{u.name}} avatar" class="w-12 h-12 rounded-full object-cover border" loading="lazy"/>
                <ng-template #init>
                  <div class="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center">{{ (u.name||'S').slice(0,1) }}</div>
                </ng-template>
                <span *ngIf="u.lastSeen" class="absolute -bottom-0.5 -right-0.5 block w-3 h-3 rounded-full ring-2 ring-white bg-green-500" title="Active recently"></span>
              </span>
              <div class="min-w-0">
                <div class="font-semibold text-gray-900 truncate">{{ u.name }}</div>
                <div class="text-xs text-gray-600 truncate">
                  <span *ngIf="u.universityId">{{ u.universityId }}</span>
                  <span *ngIf="u.location">• {{ u.location }}</span>
                </div>
                <div class="mt-1 flex items-center gap-1.5 text-[11px] text-gray-600 flex-wrap">
                  <span class="px-1.5 py-0.5 rounded-full border" [class.text-green-700]="u.badges.email" [class.bg-green-50]="u.badges.email" [class.border-green-200]="u.badges.email">Email</span>
                  <span class="px-1.5 py-0.5 rounded-full border" [class.text-green-700]="u.badges.phone" [class.bg-green-50]="u.badges.phone" [class.border-green-200]="u.badges.phone">Phone</span>
                  <span class="px-1.5 py-0.5 rounded-full border" [class.text-green-700]="u.badges.university" [class.bg-green-50]="u.badges.university" [class.border-green-200]="u.badges.university">University</span>
                  <span class="px-1.5 py-0.5 rounded-full border" [class.text-green-700]="u.badges.photo" [class.bg-green-50]="u.badges.photo" [class.border-green-200]="u.badges.photo">Photo</span>
                </div>
              </div>
            </div>
            <div class="mt-3">
              <button class="px-2.5 py-1.5 text-sm border rounded-md">View Profile</button>
            </div>
          </a>
        </div>

        <div class="mt-6 flex items-center justify-center" *ngIf="loading()">
          <span class="text-sm text-gray-500">Loading…</span>
        </div>
        <div class="mt-6 flex items-center justify-center" *ngIf="!loading() && nextCursor()">
          <button (click)="loadMore()" class="px-3 py-1.5 border rounded-md text-sm focus-ring">Load more</button>
        </div>
      </main>
    </div>
  </div>
  `,
  styles: [`
    .animate-fade-in { animation: fade .2s ease-in; }
    @keyframes fade { from { opacity: 0 } to { opacity: 1 } }
  `]
})
export class PeoplePage {
  private svc = inject(PeopleDirectoryService);
  users: Signal<DirectoryUser[]> = this.svc.users;
  loading = this.svc.loading;
  nextCursor = this.svc.nextCursor;

  filters = signal<PeopleFilters>({ q: '', roles: { student:false, professional:false }, orgs: [], location: {}, verified: { email:false, phone:false, edu:false }, interests: [], sort: 'recent' });
  animate = signal(false);

  constructor(){
    this.svc.reset();
    this.svc.list({ includeIncomplete: true });
  }

  totalCount(): number { return this.users().length; }

  apply(f: PeopleFilters){ this.filters.set(f); this.animate.set(true); setTimeout(() => this.animate.set(false), 150); }
  clear(){ this.filters.set({ q:'', roles:{student:false, professional:false}, orgs:[], location:{}, verified:{email:false, phone:false, edu:false}, interests:[], sort:'recent' }); }
  onSort(ev: Event){ const v = (ev.target as HTMLSelectElement).value as any; this.filters.update(x => ({ ...x, sort: v })); }

  filtered: Signal<DirectoryUser[]> = computed(() => {
    const list = this.users();
    const f = this.filters();
    let out = list.slice();

    // A. Search text (name/university/location contains)
    const q = (f.q||'').trim().toLowerCase();
    if (q) out = out.filter(u => (u.name||'').toLowerCase().includes(q) || (u.universityId||'').toLowerCase().includes(q) || (u.location||'').toLowerCase().includes(q));

    // C. Orgs tokens
    if (f.orgs.length) {
      const tokens = f.orgs.map(s => s.toLowerCase());
      out = out.filter(u => tokens.some(t => (u.universityId||'').toLowerCase().includes(t)));
    }

    // D. Location fields
    const city = (f.location.city||'').toLowerCase();
    const state = (f.location.state||'').toLowerCase();
    const country = (f.location.country||'').toLowerCase();
    if (city) out = out.filter(u => (u.location||'').toLowerCase().includes(city));
    if (state) out = out.filter(u => (u.location||'').toLowerCase().includes(state));
    if (country) out = out.filter(u => (u.location||'').toLowerCase().includes(country));

    // E. Verification badges
    if (f.verified.email) out = out.filter(u => !!u.badges?.email);
    if (f.verified.phone) out = out.filter(u => !!u.badges?.phone);
    if (f.verified.edu) out = out.filter(u => !!u.badges?.university);

    // G. Sorting
    const collator = new Intl.Collator();
    if (f.sort === 'alpha') out.sort((a,b) => collator.compare(a.name||'', b.name||''));
    else if (f.sort === 'university') out.sort((a,b) => collator.compare(a.universityId||'', b.universityId||''));
    else if (f.sort === 'location') out.sort((a,b) => collator.compare(a.location||'', b.location||''));
    else if (f.sort === 'recent') out.sort((a,b) => (Date.parse(b.lastSeen||'')||0) - (Date.parse(a.lastSeen||'')||0));

    return out;
  });

  loadMore(){ this.svc.loadMore(); }
  invite(){ try { navigator.share?.({ title: 'Join Setly', url: location.origin }); } catch {} }
}
