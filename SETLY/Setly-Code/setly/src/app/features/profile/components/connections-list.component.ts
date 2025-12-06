import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Connection } from '../../../core/models/profile.model';

@Component({
  selector: 'app-connections-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="connections-grid" *ngIf="connections?.length; else empty">
      <div *ngFor="let c of connections" class="conn-card">
        <img *ngIf="c.avatarUrl" [src]="c.avatarUrl" [alt]="c.name" class="avatar-img" />
        <div *ngIf="!c.avatarUrl" class="thumb">{{ c.name.charAt(0).toUpperCase() }}</div>
        <div class="meta">
          <div class="name">{{ c.name }}</div>
          <div class="uni" *ngIf="c.university">{{ c.university }}</div>
          <div class="stats">
            <ng-container *ngIf="c.tags?.length">
              <span class="tag" *ngFor="let tag of c.tags">{{ tag }}</span>
            </ng-container>
          </div>
        </div>
        <div class="overlay">
          <div class="o-row"><span>📍</span> {{ c.location || 'Unknown' }}</div>
          <div class="o-row" *ngIf="c.mutualUniversities"><span>🏫</span> {{ c.mutualUniversities }} mutual unis</div>
          <div class="o-row" *ngIf="c.sharedTrips"><span>🚗</span> {{ c.sharedTrips }} trips</div>
        </div>
      </div>
    </div>
    <ng-template #empty>
      <div class="empty-state">No connections yet. Start by booking a room or ride!</div>
    </ng-template>
  `,
  styles: [`
    .connections-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    @media (max-width: 640px) {
      .connections-grid {
        grid-template-columns: 1fr;
      }
    }

    .empty-state {
      text-align: center;
      padding: 32px 16px;
      color: #94a3b8;
      font-size: 14px;
    }

    .conn-card { position:relative; padding:1rem; border:1px solid #e2e8f0; border-radius:1rem; background:#fff; display:flex; align-items:center; gap:.75rem; overflow:hidden; transition:transform .3s ease, box-shadow .3s ease; }
    .conn-card:hover { transform:translateY(-2px); box-shadow:0 14px 30px -16px rgba(0,0,0,.2); }
    .conn-card::after { content:''; position:absolute; inset:0; border-radius:inherit; padding:1px; background:linear-gradient(135deg,rgba(90,79,243,.5),rgba(157,132,255,.25)); -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0); -webkit-mask-composite:xor; mask-composite:exclude; opacity:0; transition:opacity .3s; }
    .conn-card:hover::after { opacity:1; }
    .thumb { width:2.75rem; height:2.75rem; border-radius:.9rem; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,var(--gradient-start),var(--gradient-end)); color:#fff; font-weight:700; box-shadow:0 6px 16px -8px rgba(90,79,243,.6); }
    .avatar-img { width:2.75rem; height:2.75rem; border-radius:.9rem; object-fit:cover; box-shadow:0 6px 16px -8px rgba(90,79,243,.6); flex-shrink:0; }
    .meta { flex:1; min-width:0; }
    .name { font-size:.9rem; font-weight:600; color:#0f172a; letter-spacing:.01em; }
    .uni { font-size:.65rem; color:#6366f1; font-weight:500; margin-top:.1rem; }
    .stats { margin-top:.3rem; display:flex; gap:.4rem; flex-wrap:wrap; }
    .tag { font-size:.6rem; color:#fff; font-weight:600; background:linear-gradient(135deg,#10b981,#22c55e); padding:.15rem .5rem; border-radius:.4rem; letter-spacing:.02em; }
    .overlay { position:absolute; inset:0; background:linear-gradient(135deg,rgba(15,23,42,.0), rgba(15,23,42,.85)); color:#fff; padding:1rem; display:flex; flex-direction:column; gap:.35rem; opacity:0; transition:opacity .3s; }
    .conn-card:hover .overlay { opacity:1; }
    .o-row { display:flex; align-items:center; gap:.45rem; font-size:.8rem; font-weight:600; }
  `]
})
export class ConnectionsListComponent {
  @Input() connections: Connection[] = [];
}
