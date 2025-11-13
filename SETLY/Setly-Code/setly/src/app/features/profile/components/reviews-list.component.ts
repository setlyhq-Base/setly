import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Review } from '../../../core/models/profile.model';
import { InViewDirective } from '../../../shared/directives/in-view.directive';

@Component({
  selector: 'app-reviews-list',
  standalone: true,
  imports: [CommonModule, InViewDirective],
  template: `
    <section class="reviews-card will-fade-up" inView>
      <div class="header">
        <h2 class="title gradient-text">What others say about you</h2>
        <button class="btn-primary text-sm" *ngIf="canWriteReview" (click)="write.emit()">✍️ Review</button>
      </div>
      <div class="segmented" role="tablist">
        <button *ngFor="let tab of tabs" (click)="activeTab = tab" class="seg-btn" [class.on]="activeTab === tab" role="tab" [attr.aria-selected]="activeTab === tab">
          <span class="dot" [class.dot-on]="activeTab === tab"></span>{{ tab | titlecase }}
        </button>
      </div>

      <div *ngIf="filtered().length; else empty" class="bubble-wrap" aria-live="polite">
        <div *ngFor="let r of filtered(); let i = index" class="bubble will-fade-up" inView [style.animationDelay]="(i * 55)+'ms'">
          <div class="bubble-head">
            <div class="avatar" aria-hidden="true">{{ r.fromUserId.charAt(0).toUpperCase() }}</div>
            <div class="info">
              <div class="row"><span class="name">{{ r.fromUserId }}</span><span class="date">{{ r.createdAt | date:'MMM d, y' }}</span></div>
              <div class="row sub" *ngIf="r.city">{{ r.city }}</div>
              <div class="stars" *ngIf="r.rating">
                <ng-container *ngFor="let s of [1,2,3,4,5]; let idx = index">
                  <span class="star" [class.on]="idx < (r.rating || 0)">★</span>
                </ng-container>
              </div>
            </div>
          </div>
          <p class="comment">{{ r.comment }}</p>
        </div>
      </div>
      <ng-template #empty>
        <div class="empty">
          <div class="illustration" aria-hidden="true">🕊️</div>
          <p>No reviews yet. Complete your profile and host your first room to get started.</p>
        </div>
      </ng-template>
    </section>
  `,
  styles: [`
    :host { display:block; }
    .reviews-card { background:#fff; border:1px solid #e5e7eb; border-radius:1.25rem; padding:2rem; box-shadow:var(--shadow-soft); position:relative; overflow:hidden; }
    .reviews-card::after { content:''; position:absolute; inset:0; background:radial-gradient(circle at 92% 12%,rgba(90,79,243,0.12),transparent 55%); pointer-events:none; }
    .header { display:flex; align-items:center; justify-content:space-between; margin-bottom:1.25rem; }
    .title { font-size:1.05rem; font-weight:600; letter-spacing:-0.01em; }
  /* Use global btn-primary for actions */
    .segmented { display:inline-flex; background:#f3f4f6; border:1px solid #e5e7eb; padding:4px; border-radius:999px; gap:4px; margin-bottom:1.1rem; }
    .seg-btn { position:relative; background:transparent; border:none; font-size:0.6rem; font-weight:600; letter-spacing:.07em; text-transform:uppercase; padding:.45rem .9rem; border-radius:999px; color:#475569; cursor:pointer; transition:color .3s; }
    .seg-btn.on { color:#fff; }
    .seg-btn.on::before { content:''; position:absolute; inset:0; background:linear-gradient(90deg,var(--gradient-start),var(--gradient-end)); border-radius:inherit; z-index:-1; box-shadow:0 6px 18px -8px rgba(90,79,243,.6); animation:fadeIn .4s ease; }
    .seg-btn .dot { width:.45rem; height:.45rem; border-radius:50%; background:#cbd5e1; display:inline-block; margin-right:.4rem; transition:background .3s; }
    .seg-btn .dot-on { background:linear-gradient(90deg,var(--gradient-start),var(--gradient-end)); }
    .bubble-wrap { display:grid; gap:1rem; grid-template-columns:repeat(auto-fill,minmax(230px,1fr)); }
    .bubble { position:relative; background:#fff; border:1px solid #e5e7eb; border-radius:1rem; padding:1rem 1rem 1.05rem; box-shadow:0 4px 14px -6px rgba(0,0,0,.12); display:flex; flex-direction:column; gap:.65rem; }
    .bubble::after { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(90,79,243,.09),rgba(157,132,255,.08)); border-radius:inherit; opacity:0; transition:opacity .35s; }
    .bubble:hover::after { opacity:.55; }
    .bubble-head { display:flex; gap:.75rem; align-items:flex-start; }
    .avatar { width:2.4rem; height:2.4rem; border-radius:.8rem; background:linear-gradient(135deg,var(--gradient-start),var(--gradient-end)); display:flex; align-items:center; justify-content:center; color:#fff; font-weight:600; letter-spacing:.02em; box-shadow:0 4px 12px -4px rgba(90,79,243,.55); }
    .info { flex:1; }
    .row { display:flex; gap:.5rem; align-items:center; flex-wrap:wrap; }
    .name { font-size:.75rem; font-weight:600; color:#111827; }
    .date { font-size:.6rem; font-weight:600; letter-spacing:.06em; text-transform:uppercase; color:#64748b; }
    .sub { font-size:.6rem; color:#6366f1; font-weight:500; letter-spacing:.04em; }
    .comment { font-size:.7rem; line-height:1.5; color:#334155; font-weight:500; }
    .stars { margin-top:.25rem; display:flex; gap:.1rem; }
    .star { font-size:.7rem; color:#d1d5db; }
    .star.on { color:#f59e0b; text-shadow:0 0 0 rgba(0,0,0,0); }
    .empty { text-align:center; padding:3rem 1.5rem; color:#6b7280; font-size:0.85rem; }
    .illustration { font-size:2.25rem; margin-bottom:.5rem; filter:drop-shadow(0 4px 10px rgba(0,0,0,0.08)); }
    @media (max-width:640px){ .reviews-card { padding:1.25rem; } .review-card { flex:0 0 78%; } }
  `]
})
export class ReviewsListComponent {
  @Input() reviews: Review[] = [];
  @Input() canWriteReview = false;
  @Output() write = new EventEmitter<void>();

  tabs: Review['type'][] = ['received', 'given', 'pending'];
  activeTab: Review['type'] = 'received';

  filtered(): Review[] {
    return this.reviews.filter(r => r.type === this.activeTab);
  }
}
