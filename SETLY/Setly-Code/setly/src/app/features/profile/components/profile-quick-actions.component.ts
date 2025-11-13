import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InViewDirective } from '../../../shared/directives/in-view.directive';

export interface QuickActionsModel {
  completion: number;
  missingHint?: string;
}

@Component({
  selector: 'app-profile-quick-actions',
  standalone: true,
  imports: [CommonModule, InViewDirective],
  template: `
    <aside class="qa-card will-fade-up" inView>
      <div class="top">
        <h3 class="title">Quick Actions</h3>
        <div class="ring">
          <svg viewBox="0 0 36 36" class="progress">
            <path class="bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
            <path class="fg" [attr.stroke-dasharray]="dash()" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
          </svg>
          <div class="pct">{{ model?.completion || 0 }}%</div>
        </div>
      </div>
      <p class="hint" *ngIf="model && model.completion < 100">Your profile is {{ model.completion }}% complete • {{ model.missingHint || 'Add phone to verify' }}</p>
      <div class="actions">
        <button class="primary" (click)="onEdit()">Edit Profile</button>
        <button class="secondary" (click)="onViewPublic()">View Public Profile</button>
      </div>
    </aside>
  `,
  styles: [`
    :host { display:block; }
    .qa-card { background:#fff; border:1px solid #e5e7eb; border-radius:1.25rem; padding:1.25rem; box-shadow:var(--shadow-soft); position:sticky; top:1rem; }
    .top { display:flex; align-items:center; justify-content:space-between; margin-bottom:.75rem; }
    .title { font-size:.9rem; font-weight:700; letter-spacing:.02em; color:#111827; }
    .ring { position:relative; width:72px; height:72px; }
    .progress { width:72px; height:72px; transform:rotate(-90deg); }
    .bg { fill:none; stroke:#eef2ff; stroke-width:3.5; }
    .fg { fill:none; stroke:url(#grad); stroke-width:3.5; stroke-linecap:round; transition:stroke-dasharray .45s ease; }
    .pct { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:.8rem; font-weight:700; color:#4f46e5; }
    .hint { font-size:.8rem; color:#6b7280; margin-bottom:.75rem; }
    .actions { display:flex; flex-direction:column; gap:.5rem; }
    .primary { background:linear-gradient(90deg,var(--gradient-start),var(--gradient-end)); color:#fff; border:none; border-radius:.75rem; padding:.6rem .9rem; font-weight:700; letter-spacing:.02em; box-shadow:0 8px 22px -8px rgba(90,79,243,.6); transition:filter .25s, transform .25s; }
    .primary:hover { filter:brightness(1.06); transform:translateY(-1px); }
    .secondary { background:#fff; color:#111827; border:1px solid #e5e7eb; border-radius:.75rem; padding:.6rem .9rem; font-weight:600; }
  `]
})
export class ProfileQuickActionsComponent {
  @Input() model?: QuickActionsModel;

  dash(): string {
    const pct = Math.max(0, Math.min(100, this.model?.completion ?? 0));
    const circ = 100; // 100 units
    return `${(pct/100)*circ} ${circ}`;
  }

  onEdit() {
    const event = new CustomEvent('quick-edit');
    window.dispatchEvent(event);
  }

  onViewPublic() {
    const event = new CustomEvent('quick-view-public');
    window.dispatchEvent(event);
  }
}
