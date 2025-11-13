import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserStore } from '../../../core/state/user.store';

export interface ListingCardItem {
  id: string;
  title: string;
  city: string;
  state?: string;
  coverImage?: string;
  description?: string;
  createdAt?: string; // ISO
  type: 'room' | 'ride';
}

@Component({
  selector: 'app-my-listings',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="card">
      <div class="card-header">
        <h2 class="card-title">My Listings</h2>
  <a routerLink="/open-room" class="add-btn ripple">+ Add Listing</a>
      </div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" *ngIf="items?.length; else empty">
        <div *ngFor="let it of items" class="listing-card">
          <div class="media">
            <img *ngIf="it.coverImage" [src]="it.coverImage" class="img"/>
            <div class="chip">{{ it.type === 'room' ? '🏠 Room' : '🚗 Ride' }}</div>
          </div>
          <div class="body">
            <div class="title">{{ it.title }}</div>
            <div class="loc">📍 {{ it.city }}<span *ngIf="it.state">, {{ it.state }}</span></div>
            <div class="desc" *ngIf="it.description">{{ it.description }}</div>
            <div class="host" *ngIf="userStore.user() as u">
              <img [src]="u.photoUrl || '/assets/placeholder-avatar.jpg'" alt="Your avatar" class="avatar"/>
              <span>Hosted by You</span>
            </div>
          </div>
          <div class="glow"></div>
        </div>
      </div>
      <ng-template #empty>
        <div class="empty-state">
          <div class="illus" aria-hidden="true">📦</div>
          <p class="msg">You haven’t posted any listings yet.</p>
          <a routerLink="/open-room" class="empty-cta ripple">Create your first</a>
        </div>
      </ng-template>
    </section>
  `,
  styles: [`
    .card { @apply bg-white rounded-2xl shadow-sm border border-gray-200 p-6; }
    .card-header { @apply flex items-center justify-between mb-4; }
    .card-title { @apply text-lg font-semibold; }
    .add-btn { @apply text-sm px-3 py-1.5 rounded-full text-white shadow hover:opacity-90; background:linear-gradient(90deg,var(--gradient-start),var(--gradient-end)); }
    .listing-card { position:relative; border:1px solid #e2e8f0; border-radius:1.1rem; overflow:hidden; background:#fff; display:flex; flex-direction:column; box-shadow:0 6px 18px -10px rgba(0,0,0,.12); transition:transform .4s cubic-bezier(.16,.8,.3,1), box-shadow .4s; }
    .listing-card:hover { transform:translateY(-4px); box-shadow:0 18px 38px -16px rgba(0,0,0,.3); }
    .media { position:relative; height:140px; background:linear-gradient(145deg,#eef2ff,#f1f5f9); display:flex; align-items:center; justify-content:center; overflow:hidden; }
    .media .img { width:100%; height:100%; object-fit:cover; }
    .listing-card .chip { position:absolute; top:10px; left:10px; background:#fff; font-size:.6rem; font-weight:600; padding:.35rem .6rem; border-radius:.7rem; letter-spacing:.08em; box-shadow:0 4px 10px -4px rgba(0,0,0,.15); border:1px solid #e2e8f0; }
    .body { padding:0.85rem 0.95rem 1.05rem; display:flex; flex-direction:column; gap:.4rem; }
    .title { font-size:.9rem; font-weight:600; letter-spacing:.01em; color:#0f172a; }
    .loc { font-size:.65rem; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:#6366f1; }
    .desc { font-size:.7rem; line-height:1.4; color:#475569; }
    .host { display:flex; align-items:center; gap:.5rem; margin-top:.35rem; font-size:.7rem; color:#334155; }
    .host .avatar { width:18px; height:18px; border-radius:9999px; object-fit:cover; border:1px solid #e2e8f0; }
    .glow { pointer-events:none; position:absolute; inset:0; background:radial-gradient(circle at 30% 20%,rgba(157,132,255,.18),transparent 60%), radial-gradient(circle at 80% 10%,rgba(90,79,243,.18),transparent 55%); opacity:0; transition:opacity .5s; }
    .listing-card:hover .glow { opacity:1; }
    .empty-state { text-align:center; padding:3.5rem 1.5rem; display:flex; flex-direction:column; gap:1rem; color:#64748b; }
    .empty-state .illus { font-size:2.75rem; filter:drop-shadow(0 6px 16px rgba(0,0,0,.12)); }
    .empty-state .msg { font-size:.9rem; font-weight:500; }
    .empty-cta { display:inline-block; align-self:center; font-size:.7rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; padding:.65rem 1.1rem; border-radius:.85rem; color:#fff; background:linear-gradient(90deg,var(--gradient-start),var(--gradient-end)); box-shadow:0 10px 24px -12px rgba(90,79,243,.55); }
  `]
})
export class MyListingsComponent {
  @Input() items: ListingCardItem[] = [];
  public userStore = inject(UserStore);
}
