import { Component, OnInit, computed, inject, signal, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UserStore } from '../../core/state/user.store';
import { ProfileStore } from '../../core/state/profile.store';
import { MyListingsComponent, ListingCardItem } from './components/my-listings.component';

interface PillStat { label: string; value: number; icon?: string }

@Component({
  selector: 'app-profile-v2',
  standalone: true,
  imports: [CommonModule, RouterModule, MyListingsComponent],
  template: `
  <div class="max-w-5xl mx-auto px-4 py-6 text-[#0F1A3B]">
    <!-- Header -->
    <section class="bg-white rounded-[24px] shadow-sm p-6 flex items-center gap-5">
      <img [src]="user()?.photoUrl || '/assets/avatar-placeholder.png'" class="w-24 h-24 rounded-full object-cover border" alt="avatar"/>
      <div class="min-w-0">
        <h1 class="text-2xl font-semibold truncate">{{ user()?.name || 'Your Profile' }}</h1>
        <div class="text-sm text-gray-600 truncate">
          <span>{{ role() }}</span>
          <span *ngIf="university()"> • {{ university() }}</span>
          <span *ngIf="location()"> • {{ location() }}</span>
        </div>
        <div class="mt-2 flex items-center gap-1.5 text-[12px] text-gray-700 flex-wrap">
          <span class="px-2 py-0.5 rounded-full border" [class.text-green-700]="verif().email" [class.bg-green-50]="verif().email" [class.border-green-200]="verif().email">Email</span>
          <span class="px-2 py-0.5 rounded-full border" [class.text-green-700]="verif().phone" [class.bg-green-50]="verif().phone" [class.border-green-200]="verif().phone">Phone</span>
          <span class="px-2 py-0.5 rounded-full border" [class.text-green-700]="verif().university" [class.bg-green-50]="verif().university" [class.border-green-200]="verif().university">University</span>
        </div>
      </div>
      <div class="ml-auto flex items-center gap-2">
        <a routerLink="/profile" class="px-4 py-2 rounded-full text-white text-sm shadow-sm bg-gradient-to-r from-[#3A7AFE] to-[#7A5CFF] hover:opacity-95">Edit Profile</a>
        <a [routerLink]="['/profile', user()?.id]" class="px-4 py-2 rounded-full border text-sm">Public View</a>
      </div>
    </section>

    <!-- Quick stats -->
    <section class="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <div *ngFor="let s of stats()" class="bg-white rounded-full shadow-sm px-4 py-2 flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full" [style.background]="s.icon || 'linear-gradient(90deg,#3A7AFE,#7A5CFF)'"></span>
        <span class="text-sm">{{ s.label }}</span>
        <span class="ml-auto font-semibold">{{ s.value }}</span>
      </div>
    </section>

    <!-- Tabs -->
    <nav class="mt-6 border-b flex gap-4 overflow-x-auto">
      <button *ngFor="let t of tabs" (click)="setTab(t)" class="py-2 text-sm border-b-2 -mb-px" [class.border-transparent]="activeTab() !== t" [class.border-[#3A7AFE]]="activeTab() === t">
        {{ t }}
      </button>
    </nav>

    <!-- Overview -->
    <section *ngIf="activeTab() === 'Overview'" class="mt-6 grid gap-6 md:grid-cols-3">
      <div class="md:col-span-2 grid gap-6">
        <div class="bg-white rounded-[24px] shadow-sm p-5">
          <h2 class="text-lg font-semibold mb-2">About</h2>
          <p class="text-sm text-gray-700" *ngIf="about(); else noAbout">{{ about() }}</p>
          <ng-template #noAbout><p class="text-sm text-gray-500">Add a short intro to tell others about you.</p></ng-template>
        </div>

        <div class="grid gap-6 md:grid-cols-2">
          <div class="bg-white rounded-[24px] shadow-sm p-5">
            <h3 class="font-medium mb-1">Profession / Field of Study</h3>
            <p class="text-sm text-gray-700" *ngIf="headline(); else noHeadline">{{ headline() }}</p>
            <ng-template #noHeadline><p class="text-sm text-gray-500">Add your field or current role.</p></ng-template>
          </div>
          <div class="bg-white rounded-[24px] shadow-sm p-5">
            <h3 class="font-medium mb-1">Languages</h3>
            <div *ngIf="languages().length; else noLangs" class="flex flex-wrap gap-2">
              <span *ngFor="let l of languages()" class="px-2 py-1 rounded-full bg-gray-100 text-sm">{{ l }}</span>
            </div>
            <ng-template #noLangs><p class="text-sm text-gray-500">Add languages you speak.</p></ng-template>
          </div>
        </div>

        <div class="bg-white rounded-[24px] shadow-sm p-5">
          <h3 class="font-medium mb-2">Interests</h3>
          <div *ngIf="interests().length; else noInterests" class="flex flex-wrap gap-2">
            <span *ngFor="let i of interests()" class="px-2 py-1 rounded-full bg-gray-100 text-sm">{{ i }}</span>
          </div>
          <ng-template #noInterests><p class="text-sm text-gray-500">Add topics you’re into.</p></ng-template>
        </div>

        <div class="bg-white rounded-[24px] shadow-sm p-5">
          <h3 class="font-medium mb-2">Reviews</h3>
          <p class="text-sm text-gray-500">No reviews yet.</p>
        </div>
      </div>

      <aside class="grid gap-6">
        <div class="bg-white rounded-[24px] shadow-sm p-5">
          <h3 class="font-semibold mb-3">Connections</h3>
          <div class="flex -space-x-3 mb-2">
            <img *ngFor="let i of [1,2,3,4,5]" src="/assets/avatar-placeholder.png" class="w-8 h-8 rounded-full border" alt="connection"/>
          </div>
          <a routerLink="/connect" class="text-sm text-[#3A7AFE] hover:underline">See all connections</a>
        </div>

        <div class="bg-white rounded-[24px] shadow-sm p-5">
          <h3 class="font-semibold mb-3">Verification</h3>
          <ul class="space-y-2 text-sm">
            <li class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full" [style.background]="verif().email ? '#22c55e' : '#e5e7eb'"></span> Email verification</li>
            <li class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full" [style.background]="verif().phone ? '#22c55e' : '#e5e7eb'"></span> Phone verification</li>
            <li class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full" [style.background]="verif().university ? '#22c55e' : '#e5e7eb'"></span> University verification</li>
          </ul>
        </div>
      </aside>
    </section>

    <!-- Rooms tab (uses My Listings under the hood in future) -->
    <section *ngIf="activeTab() === 'Rooms'" class="mt-6">
      <app-my-listings [items]="myListings()"></app-my-listings>
    </section>

    <!-- Other tabs -->
    <section *ngIf="activeTab() !== 'Overview' && activeTab() !== 'Rooms'" class="mt-6">
      <p class="text-sm text-gray-600">{{ activeTab() }} – Coming soon.</p>
    </section>
  </div>
  `
})
export class ProfileV2Page implements OnInit {
  private http = inject(HttpClient);
  private userStore = inject(UserStore);
  private profileStore = inject(ProfileStore);

  tabs = ['Overview','Rooms','Rides','Marketplace','Connections','Verification','Settings','Preferences'];
  private _tab = signal<string>('Overview');
  activeTab = this._tab.asReadonly();
  setTab(t: string){ this._tab.set(t); }

  user = this.userStore.user;
  profile = this.profileStore.profile;
  verifications = this.profileStore.verifications;

  role = computed(() => (this.user()?.role === 'student' || this.university()) ? 'Student' : 'Professional');
  university = computed(() => (this.user() as any)?.universityId || this.profile()?.university);
  location = computed(() => this.profile()?.location || this.deriveLocation());
  about = computed(() => this.profile()?.about || '');
  headline = computed(() => this.user()?.headline || '');
  languages = computed(() => this.profile()?.languages || []);
  interests = computed(() => this.profile()?.interests || []);

  verif = computed(() => ({
    email: this.user()?.emailVerified || this.profileStore.verifications()?.emailVerified || false,
    phone: !!this.user()?.phone || this.profileStore.verifications()?.phoneVerified || false,
    university: !!this.university()
  }));

  private _stats = signal<PillStat[]>([
    { label: 'Rooms', value: 0 },
    { label: 'Rides', value: 0 },
    { label: 'Marketplace', value: 0 },
    { label: 'Reviews', value: 0 },
    { label: 'Connections', value: 0 },
  ]);
  stats: Signal<PillStat[]> = this._stats.asReadonly();
  private _myListings = signal<ListingCardItem[]>([]);
  myListings: Signal<ListingCardItem[]> = this._myListings.asReadonly();

  async ngOnInit() {
    try {
      if (!this.user()) await this.userStore.refresh();
      if (!this.profile()) await this.profileStore.loadMe();
    } catch {}
    // Quick stats: derive room count from /api/rooms filtered by ownerId
    try {
      const uid = this.user()?.id;
      const res: any = await this.http.get(`/api/rooms`, { params: uid ? { ownerId: uid } : {} as any }).toPromise();
      const rooms = Array.isArray(res?.items) ? res.items : [];
      this._stats.update(arr => arr.map(s => s.label === 'Rooms' ? { ...s, value: rooms.length } : s));
      const mapped: ListingCardItem[] = rooms.map((r: any) => ({
        id: r.id,
        title: r.title,
        city: r.city,
        state: r.state,
        coverImage: Array.isArray(r.photos) ? r.photos[0] : undefined,
        description: r.description,
        createdAt: r.createdAt,
        type: 'room'
      }));
      this._myListings.set(mapped);
    } catch {}
  }

  private deriveLocation(): string | undefined {
    const p: any = this.profile();
    const user: any = this.user();
    const fromProfile = [p?.location].filter(Boolean).join('');
    const fromUser = [user?.city, user?.state].filter(Boolean).join(', ');
    return fromProfile || fromUser || undefined;
  }
}
