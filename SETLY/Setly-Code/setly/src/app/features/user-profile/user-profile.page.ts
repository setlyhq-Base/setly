import { Component, OnInit, inject, Signal, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UsersService } from '../../core/services/users.service';

interface UserVM {
  id: string;
  name: string;
  avatarUrl?: string;
  location?: string;
  universityId?: string;
  role: 'Student' | 'Working professional';
  badges: { email: boolean; phone: boolean; university: boolean; photo: boolean };
  joinedLabel?: string;
}

interface ListingCard {
  id: string;
  title: string;
  price?: number;
  city?: string;
  state?: string;
  photo?: string;
}

@Component({
  selector: 'app-user-profile-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <div class="max-w-5xl mx-auto px-4 py-6">
    <button class="text-sm text-indigo-600 hover:underline mb-4" (click)="goBack()">← Back to People</button>

    <section class="card-white p-5 flex gap-4 items-center">
      <img [src]="vm()?.avatarUrl || '/assets/avatar-placeholder.png'" alt="Avatar" class="w-20 h-20 rounded-full object-cover border"/>
      <div class="min-w-0">
        <h1 class="text-xl font-semibold text-gray-900 truncate">{{ vm()?.name || 'User' }}</h1>
        <div class="text-sm text-gray-600">
          <span *ngIf="vm()?.role">{{ vm()?.role }}</span>
          <span *ngIf="vm()?.universityId"> • {{ vm()?.universityId }}</span>
          <span *ngIf="vm()?.location"> • {{ vm()?.location }}</span>
          <span *ngIf="vm()?.joinedLabel" class="text-gray-500"> • {{ vm()?.joinedLabel }}</span>
        </div>
        <div class="mt-2 flex items-center gap-1.5 text-[12px] text-gray-700 flex-wrap">
          <span class="px-1.5 py-0.5 rounded-full border" [class.text-green-700]="vm()?.badges?.email" [class.bg-green-50]="vm()?.badges?.email" [class.border-green-200]="vm()?.badges?.email">Email verified</span>
          <span class="px-1.5 py-0.5 rounded-full border" [class.text-green-700]="vm()?.badges?.phone" [class.bg-green-50]="vm()?.badges?.phone" [class.border-green-200]="vm()?.badges?.phone">Phone verified</span>
          <span class="px-1.5 py-0.5 rounded-full border" [class.text-green-700]="vm()?.badges?.university" [class.bg-green-50]="vm()?.badges?.university" [class.border-green-200]="vm()?.badges?.university">University verified</span>
          <span class="px-1.5 py-0.5 rounded-full border" [class.text-green-700]="vm()?.badges?.photo" [class.bg-green-50]="vm()?.badges?.photo" [class.border-green-200]="vm()?.badges?.photo">Photo</span>
        </div>
      </div>
      <div class="ml-auto flex items-center gap-2">
        <button class="px-3 py-1.5 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-700" (click)="onConnect()">Connect</button>
        <button class="px-3 py-1.5 rounded-md border text-sm" (click)="onMessage()">Message</button>
        <button class="px-3 py-1.5 rounded-md border text-sm" (click)="onFollow()">Follow</button>
        <button class="px-3 py-1.5 rounded-md border text-sm text-gray-600" (click)="onReport()">Report</button>
      </div>
    </section>

    <section class="mt-6 grid gap-6 md:grid-cols-3">
      <div class="md:col-span-2">
        <h2 class="text-lg font-semibold text-gray-900 mb-3">About</h2>
        <div class="card-white p-4 text-sm text-gray-700">
          <p>Short bio coming soon.</p>
        </div>

        <h2 class="text-lg font-semibold text-gray-900 my-3">Activity</h2>
        <div class="grid gap-4">
          <div>
            <h3 class="font-medium text-gray-800 mb-2">Rooms by {{ vm()?.name || 'this user' }}</h3>
            <div *ngIf="rooms().length; else noRooms" class="grid gap-3 sm:grid-cols-2">
              <a *ngFor="let r of rooms()" [routerLink]="['/listing', r.id]" class="card-white p-3 flex gap-3 hover:shadow">
                <img *ngIf="r.photo" [src]="r.photo" class="w-20 h-16 object-cover rounded border" alt="Room photo"/>
                <div class="min-w-0">
                  <div class="font-medium text-gray-900 truncate">{{ r.title }}</div>
                  <div class="text-xs text-gray-600 truncate">
                    <span *ngIf="r.price"><span class="mr-0.5">$</span>{{ r.price }}</span>
                    <span *ngIf="r.city"> • {{ r.city }}</span>
                    <span *ngIf="r.state">, {{ r.state }}</span>
                  </div>
                </div>
              </a>
            </div>
            <ng-template #noRooms>
              <div class="text-sm text-gray-500">No active rooms found.</div>
            </ng-template>
          </div>

          <div>
            <h3 class="font-medium text-gray-800 mb-2">Rides</h3>
            <div class="text-sm text-gray-500">Coming soon.</div>
          </div>

          <div>
            <h3 class="font-medium text-gray-800 mb-2">Marketplace</h3>
            <div class="text-sm text-gray-500">Coming soon.</div>
          </div>
        </div>
      </div>

      <aside>
        <h2 class="text-lg font-semibold text-gray-900 mb-3">Basic info</h2>
        <div class="card-white p-4 text-sm text-gray-700 space-y-2">
          <div><span class="text-gray-500">Name:</span> {{ vm()?.name }}</div>
          <div *ngIf="vm()?.universityId"><span class="text-gray-500">University:</span> {{ vm()?.universityId }}</div>
          <div *ngIf="vm()?.location"><span class="text-gray-500">Location:</span> {{ vm()?.location }}</div>
          <div class="text-gray-500 text-xs">Sensitive contact details are hidden for privacy.</div>
        </div>
      </aside>
    </section>
  </div>
  `
})
export class UserProfilePage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private users = inject(UsersService);
  private http = inject(HttpClient);

  private _vm = signal<UserVM | null>(null);
  vm: Signal<UserVM | null> = this._vm;

  private _rooms = signal<ListingCard[]>([]);
  rooms: Signal<ListingCard[]> = this._rooms;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') || '';
    if (!id) { this.goBack(); return; }
    this.users.getUserDetail(id).subscribe(profile => {
      if (!profile) return;
      const role: UserVM['role'] = profile.universityId ? 'Student' : 'Working professional';
      const joinedLabel = profile.joinedAt ? `On Setly since ${new Date(profile.joinedAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}` : undefined;
      this._vm.set({
        id: profile.id,
        name: profile.name,
        avatarUrl: profile.avatarUrl,
        location: profile.location,
        universityId: profile.universityId,
        badges: profile.badges,
        role,
        joinedLabel
      });
    });

    // Activity: fetch rooms owned by this user (server-side filtered)
    this.http.get<any>('/api/rooms', { params: { ownerId: id } }).subscribe({
      next: (res) => {
        const items = Array.isArray(res?.items) ? res.items : [];
        const cards: ListingCard[] = items.slice(0, 6).map((r: any) => ({
          id: r.id,
          title: r.title,
          price: r.price,
          city: r.city,
          state: r.state,
          photo: Array.isArray(r.photos) ? r.photos[0] : undefined
        }));
        this._rooms.set(cards);
      },
      error: () => this._rooms.set([])
    });
  }

  goBack() {
    if (window.history.length > 1) this.router.navigateByUrl('/connect/people').catch(() => {});
    else this.router.navigate(['/connect/people']);
  }

  onConnect(){ /* TODO integrate connect flow */ }
  onMessage(){
    const v = this.vm();
    if (!v) return;
    // Navigate to Messages and seed the conversation with this user's id, name, and avatar
    this.router.navigate(['/messages'], { queryParams: { with: v.id, name: v.name, avatar: v.avatarUrl || undefined } });
  }
  onFollow(){ /* TODO integrate social graph */ }
  onReport(){ /* TODO integrate report */ }
}
