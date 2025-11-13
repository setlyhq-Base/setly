import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Connection } from '../../../core/models/profile.model';

@Component({
  selector: 'app-connections-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="card">
      <div class="card-header">
        <h2 class="card-title">Connections</h2>
        <button class="find-btn ripple">Find More</button>
      </div>
      <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-4" *ngIf="connections?.length; else empty">
        <div *ngFor="let c of connections" class="conn-card">
          <div class="thumb">{{ c.name.charAt(0).toUpperCase() }}</div>
          <div class="meta">
            <div class="name">{{ c.name }}</div>
            <div class="stats">
              <span *ngIf="c.mutualUniversities">🏫 {{ c.mutualUniversities }}</span>
              <span *ngIf="c.sharedTrips">🚗 {{ c.sharedTrips }}</span>
            </div>
          </div>
          <div class="overlay">
            <div class="o-row"><span>🏫</span> {{ c.mutualUniversities || 0 }} mutual unis</div>
            <div class="o-row"><span>🚗</span> {{ c.sharedTrips || 0 }} trips</div>
          </div>
        </div>
      </div>
      <ng-template #empty>
        <div class="text-center py-12 text-gray-500">No connections yet. Start by booking a room or ride!</div>
      </ng-template>
    </section>
  `,
  styles: [`
    .card { @apply bg-white rounded-2xl shadow-sm border border-gray-200 p-6; }
    .card-header { @apply flex items-center justify-between mb-4; }
    .card-title { @apply text-lg font-semibold; }
    .find-btn { @apply text-sm px-3 py-1.5 rounded-xl; background:linear-gradient(90deg,var(--gradient-start),var(--gradient-end)); color:#fff; box-shadow:0 8px 20px -10px rgba(90,79,243,.6); }
    .conn-card { position:relative; padding:1rem; border:1px solid #e2e8f0; border-radius:1rem; background:#fff; display:flex; align-items:center; gap:.75rem; overflow:hidden; transition:transform .3s ease, box-shadow .3s ease; }
    .conn-card:hover { transform:translateY(-2px); box-shadow:0 14px 30px -16px rgba(0,0,0,.2); }
    .conn-card::after { content:''; position:absolute; inset:0; border-radius:inherit; padding:1px; background:linear-gradient(135deg,rgba(90,79,243,.5),rgba(157,132,255,.25)); -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0); -webkit-mask-composite:xor; mask-composite:exclude; opacity:0; transition:opacity .3s; }
    .conn-card:hover::after { opacity:1; }
    .thumb { width:2.75rem; height:2.75rem; border-radius:.9rem; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,var(--gradient-start),var(--gradient-end)); color:#fff; font-weight:700; box-shadow:0 6px 16px -8px rgba(90,79,243,.6); }
    .meta { flex:1; min-width:0; }
    .name { font-size:.9rem; font-weight:600; color:#0f172a; letter-spacing:.01em; }
    .stats { margin-top:.15rem; display:flex; gap:.6rem; font-size:.7rem; color:#475569; font-weight:600; letter-spacing:.03em; }
    .overlay { position:absolute; inset:0; background:linear-gradient(135deg,rgba(15,23,42,.0), rgba(15,23,42,.85)); color:#fff; padding:1rem; display:flex; flex-direction:column; gap:.35rem; opacity:0; transition:opacity .3s; }
    .conn-card:hover .overlay { opacity:1; }
    .o-row { display:flex; align-items:center; gap:.45rem; font-size:.8rem; font-weight:600; }
  `]
})
export class ConnectionsListComponent {
  @Input() connections: Connection[] = [];
}
