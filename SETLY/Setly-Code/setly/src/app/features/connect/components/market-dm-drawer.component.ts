import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarketPost } from '../models/connect.models';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../core/services/toast.service';
import { ConnectFeedService } from '../../../core/services/connect-feed.service';

@Component({
  selector: 'app-market-dm-drawer',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" *ngIf="open">
      <div class="flex-1 bg-black/40" (click)="close()" aria-label="Close dialog background"></div>
      <div class="drawer-panel w-full sm:w-[420px] bg-white h-full sm:h-auto sm:max-h-[90vh] sm:rounded-l-2xl shadow-xl overflow-hidden flex flex-col" role="document">
        <header class="p-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-600">Message seller</div>
            <div class="text-base font-medium truncate" [title]="post?.title">{{post?.title}}</div>
          </div>
          <button class="p-2 rounded hover:bg-gray-50 focus-ring" (click)="close()" aria-label="Close">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M6 18L18 6" stroke="#6B7280" stroke-width="1.5" stroke-linecap="round"/></svg>
          </button>
        </header>

        <div class="p-4 space-y-4 overflow-y-auto">
          <!-- Quick prompts -->
          <div>
            <div class="text-xs text-gray-600 mb-2">Quick prompts</div>
            <div class="flex flex-wrap gap-2">
              <button class="chip" (click)="usePrompt('Hi! Is this still available?')">Is this available?</button>
              <button class="chip" (click)="usePrompt('Could you share more photos or details?')">More photos?</button>
              <button class="chip" (click)="usePrompt('Any issues or scratches I should know about?')">Issues/scratches?</button>
            </div>
          </div>

          <!-- Propose time/place -->
          <div>
            <div class="text-xs text-gray-600 mb-2">Propose time & place</div>
            <div class="flex flex-wrap gap-2 mb-2">
              <button class="px-2 py-1 rounded border text-xs" (click)="append(' Today 6pm')">Today 6pm</button>
              <button class="px-2 py-1 rounded border text-xs" (click)="append(' Tomorrow 10am')">Tomorrow 10am</button>
              <button class="px-2 py-1 rounded border text-xs" (click)="append(' Sat 2pm')">Sat 2pm</button>
            </div>
            <div class="flex flex-wrap gap-2">
              <button class="px-2 py-1 rounded border text-xs" (click)="append(' at Campus Center')">Campus Center</button>
              <button class="px-2 py-1 rounded border text-xs" (click)="append(' at Library lobby')">Library lobby</button>
              <button class="px-2 py-1 rounded border text-xs" (click)="append(' in front of Starbucks')">Starbucks (front)</button>
            </div>
          </div>

          <!-- Message box -->
          <div>
            <label class="text-xs text-gray-600">Message</label>
            <textarea class="mt-1 w-full border rounded-md p-2 text-sm min-h-[96px] focus-ring" [(ngModel)]="messageText" placeholder="Write a message..."></textarea>
          </div>

          <!-- Safety checklist -->
          <div class="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <div class="text-xs font-medium text-amber-900 mb-2 flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#D97706" stroke-width="1.2"/><path d="M12 8v5" stroke="#D97706" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="16" r="1" fill="#D97706"/></svg>
              Safety checklist
            </div>
            <ul class="space-y-1 text-[12px] text-amber-900">
              <li class="flex items-start gap-2"><input type="checkbox" class="mt-[3px]" [(ngModel)]="safety.public"/> Meet in a public, well-lit place</li>
              <li class="flex items-start gap-2"><input type="checkbox" class="mt-[3px]" [(ngModel)]="safety.verify"/> Verify the item before paying</li>
              <li class="flex items-start gap-2"><input type="checkbox" class="mt-[3px]" [(ngModel)]="safety.friend"/> Consider bringing a friend</li>
            </ul>
            <button class="mt-2 text-[12px] text-amber-900 underline" (click)="tipsOpen = !tipsOpen">{{ tipsOpen ? 'Hide tips' : 'Learn tips' }}</button>
            <div *ngIf="tipsOpen" class="mt-2 text-[12px] text-amber-900">
              • Prefer cash or trusted payment methods with buyer protection.<br/>
              • Avoid sharing sensitive info; keep chat within Setly.<br/>
              • If something feels off, walk away and report.
            </div>
            <button class="mt-2 text-[12px] text-red-700 underline" (click)="report()">Report listing</button>
          </div>
        </div>

        <footer class="p-4 border-t border-gray-100 flex items-center justify-between">
          <div class="text-[12px] text-gray-600" *ngIf="post?.verifiedSeller">Seller verified</div>
          <div class="flex items-center gap-2">
            <button class="px-3 py-2 border rounded-md text-sm" (click)="close()">Cancel</button>
            <button class="btn-brand px-3 py-2 rounded-md text-sm" (click)="send()" [disabled]="!messageText.trim()">Send</button>
          </div>
        </footer>
      </div>
    </div>
  `,
  styles: [`
    .drawer-panel { animation: slideIn 220ms ease; }
    @keyframes slideIn { from { transform: translateX(8px); opacity: 0.9; } to { transform: translateX(0); opacity: 1; } }
    @media (max-width: 639px) {
      .drawer-panel { width: 100%; border-top-left-radius: 16px; border-top-right-radius: 16px; margin-left: 0; }
    }
    .chip { font-size: 12px; padding: 6px 10px; border-radius: 9999px; border: 1px solid #E5E7EB; background: white; }
    .chip:focus { outline: 2px solid rgba(90,79,243,0.35); outline-offset: 1px; }
  `]
})
export class MarketDmDrawerComponent {
  private router = inject(Router);
  private toast = inject(ToastService);
  private feed = inject(ConnectFeedService);

  @Input() post?: MarketPost;
  @Input() open = false;
  @Output() closed = new EventEmitter<void>();

  messageText = 'Hi! Is this still available?';
  safety = { public: true, verify: true, friend: false };
  tipsOpen = false;

  close(){ this.closed.emit(); }
  usePrompt(text: string){ this.messageText = text; }
  append(s: string){ this.messageText = (this.messageText || '').trimEnd() + s; }
  send(){
    const seller = this.post?.sellerId || 'seller';
    const listing = this.post?.id;
    const text = this.messageText.trim();
    this.toast.success('Message sent');
    this.router.navigate(['/messages'], { queryParams: { with: seller, market: listing, text } });
    this.close();
  }
  report(){
    if (this.post?.id) {
      this.feed.report(this.post.id);
      this.toast.warning('Listing reported');
      this.close();
    }
  }
}
