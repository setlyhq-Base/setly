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
      <div class="section-header">
        <h2 class="section-title">Reviews</h2>
        <button class="btn-write" *ngIf="canWriteReview" (click)="write.emit()">✍️ Write Review</button>
      </div>
      <div class="section-divider"></div>
      <div class="segmented" role="tablist">
        <button *ngFor="let tab of tabs" (click)="activeTab = tab" class="seg-btn" [class.on]="activeTab === tab" role="tab" [attr.aria-selected]="activeTab === tab">
          <span class="dot" [class.dot-on]="activeTab === tab"></span>{{ tab | titlecase }}
        </button>
      </div>

      <div *ngIf="filtered().length; else empty" class="bubble-wrap" aria-live="polite">
        <div *ngFor="let r of filtered(); let i = index" class="bubble will-fade-up" inView [style.animationDelay]="(i * 55)+'ms'">
          <div class="bubble-head">
            <img *ngIf="r.fromUserAvatar" [src]="r.fromUserAvatar" [alt]="r.fromUserName || r.fromUserId" class="avatar-img" />
            <div *ngIf="!r.fromUserAvatar" class="avatar" aria-hidden="true">{{ (r.fromUserName || r.fromUserId).charAt(0).toUpperCase() }}</div>
            <div class="info">
              <div class="row">
                <span class="name">{{ r.fromUserName || r.fromUserId }}</span>
                <span class="date">{{ r.createdAt | date:'MMM d, y' }}</span>
              </div>
              <div class="row sub" *ngIf="r.fromUserLocation || r.city">{{ r.fromUserLocation || r.city }}</div>
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
    .reviews-card { 
      background: #FFFFFF; 
      border-radius: 20px; 
      border: 1px solid #ECECEC;
      padding: 32px; /* More padding */
      box-shadow: 0 4px 16px -4px rgba(10, 26, 63, 0.08), 0 2px 8px -2px rgba(0, 0, 0, 0.04); 
      position: relative; 
      overflow: hidden;
      transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .reviews-card:hover {
      box-shadow: 0 12px 40px -8px rgba(10, 26, 63, 0.12), 0 8px 24px -4px rgba(62, 143, 255, 0.12);
      transform: translateY(-3px);
    }
    .section-header { 
      display: flex; 
      align-items: center; 
      justify-content: space-between; 
      margin-bottom: 16px;
      padding-top: 4px;
    }
    .section-title { 
      font-size: 22px; /* Larger title */
      font-weight: 700; 
      color: #0A1A3F; 
      margin: 0;
      letter-spacing: -0.03em;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .section-title::before {
      content: '';
      width: 4px;
      height: 24px;
      background: linear-gradient(180deg, #0F5FFF 0%, #0A4FD9 100%);
      border-radius: 4px;
      display: inline-block;
    }
    .section-divider {
      height: 2px;
      background: linear-gradient(to right, #e5e7eb 0%, #f1f5f9 100%);
      margin-bottom: 24px;
      border-radius: 2px;
    }
    .btn-write {
      background: transparent;
      border: none;
      color: #0F5FFF;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      padding: 8px 16px;
      border-radius: 12px;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .btn-write:hover {
      background: linear-gradient(135deg, #f0f7ff 0%, #e0f2fe 100%);
      transform: scale(1.05);
      box-shadow: 0 2px 8px rgba(15, 95, 255, 0.15);
    }
    .segmented { display:inline-flex; background:#f8fafc; border:1px solid #e5e7eb; padding:5px; border-radius:999px; gap:4px; margin-bottom:1.5rem; box-shadow:0 2px 6px rgba(0,0,0,0.05); }
    .seg-btn { position:relative; background:transparent; border:none; font-size:0.68rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; padding:.55rem 1.1rem; border-radius:999px; color:#64748b; cursor:pointer; transition:all .3s cubic-bezier(0.4, 0, 0.2, 1); }
    .seg-btn.on { color:#fff; }
    .seg-btn.on::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,#0F5FFF,#0A4FD9); border-radius:inherit; z-index:-1; box-shadow:0 4px 14px -4px rgba(15,95,255,0.5); animation:fadeIn .4s ease; }
    .seg-btn .dot { width:.48rem; height:.48rem; border-radius:50%; background:#cbd5e1; display:inline-block; margin-right:.45rem; transition:all .3s; }
    .seg-btn .dot-on { background:#fff; box-shadow:0 2px 4px rgba(0,0,0,0.1); }
    .bubble-wrap { display:grid; gap:1.2rem; grid-template-columns:repeat(auto-fill,minmax(250px,1fr)); }
    .bubble { 
      position:relative; 
      background:#fafbfc; 
      border:1px solid #e5e7eb; 
      border-radius:16px; 
      padding:1.3rem; 
      box-shadow:0 3px 10px -3px rgba(0,0,0,.1); 
      display:flex; 
      flex-direction:column; 
      gap:.8rem;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border-bottom: 3px solid transparent; /* Separator effect */
    }
    .bubble:hover { 
      background:#fff;
      border-color:#0F5FFF;
      border-bottom-color: #0F5FFF;
      box-shadow:0 8px 24px -6px rgba(15,95,255,0.2);
      transform: translateY(-4px) scale(1.02);
    }
    .bubble-head { display:flex; gap:.9rem; align-items:flex-start; padding-bottom:.8rem; border-bottom:1px solid #f1f5f9; margin-bottom:.4rem; }
    .avatar { 
      width:2.7rem; 
      height:2.7rem; 
      border-radius:.9rem; 
      background:linear-gradient(135deg,#667eea,#764ba2); 
      display:flex; 
      align-items:center; 
      justify-content:center; 
      color:#fff; 
      font-weight:700; 
      font-size:1.05rem;
      letter-spacing:.02em; 
      box-shadow:0 4px 12px -3px rgba(102,126,234,.6); 
    }
    .avatar-img { 
      width:2.7rem; 
      height:2.7rem; 
      border-radius:.9rem; 
      object-fit:cover; 
      box-shadow:0 4px 12px -3px rgba(0,0,0,.35);
      border: 3px solid #fff;
    }
    .info { flex:1; }
    .row { display:flex; gap:.6rem; align-items:center; flex-wrap:wrap; }
    .name { font-size:.87rem; font-weight:700; color:#0A1A3F; }
    .date { font-size:.62rem; font-weight:600; letter-spacing:.06em; text-transform:uppercase; color:#94a3b8; /* Lighter date text */ }
    .sub { font-size:.68rem; color:#0369a1; font-weight:600; letter-spacing:.03em; }
    .comment { font-size:.78rem; line-height:1.65; color:#475569; font-weight:500; margin:0; }
    .stars { margin-top:.35rem; display:flex; gap:.18rem; }
    .star { font-size:.78rem; color:#e2e8f0; transition:color .2s; }
    .star.on { color:#f59e0b; text-shadow:0 1px 2px rgba(245,158,11,0.3); }
    .empty { text-align:center; padding:3.5rem 1.5rem; color:#6b7280; font-size:0.92rem; line-height:1.6; }
    .illustration { font-size:2.8rem; margin-bottom:.7rem; opacity:0.9; }
    @media (max-width:640px){ 
      .reviews-card { padding:1.8rem; } 
      .bubble-wrap { grid-template-columns:1fr; }
    }
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
