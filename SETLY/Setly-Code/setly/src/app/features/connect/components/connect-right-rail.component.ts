import { Component, EventEmitter, Output, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../core/services/toast.service';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { Router } from '@angular/router';
import { ProgressRingComponent } from './progress-ring.component';
import { ConnectSocialService } from '../../../core/services/connect-social.service';
import { SavedSearch, SuggestionPerson } from '../models/connect.models';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-connect-right-rail',
  standalone: true,
  imports: [CommonModule, FormsModule, ProgressRingComponent],
  template: `
  <div class="space-y-6" aria-label="Right rail" [class.mobile-carousel]="isMobile" style="max-width:320px;">
      <!-- People You May Know -->
  <details [attr.open]="!isMobile ? true : null" class="card-white p-5 rail-section unified-feed-card" [class.snap-start]="isMobile" style="border-radius:14px;">
  <summary class="font-semibold text-lg mb-3 cursor-pointer text-gray-900">People You May Know</summary>
          <div class="space-y-2">
          <div *ngFor="let p of people" class="flex items-center justify-between group">
            <div class="flex items-center gap-2">
              <div class="relative">
                <div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">{{p.initial}}</div>
                <span *ngIf="p.activeNow" class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-white" aria-label="Active now"></span>
              </div>
              <div class="flex flex-col leading-tight">
                <span class="text-sm font-medium">{{p.name}}</span>
                <span *ngIf="p.mutualUniversity" class="text-[11px] text-gray-500">Mutual university: {{p.mutualUniversity}}</span>
              </div>
            </div>
            <div class="flex items-center gap-1 opacity-90">
              <button *ngIf="!p.connected" (click)="connect(p)" class="btn-brand px-3 py-1 rounded-md text-xs" aria-label="Connect {{p.name}}">Connect</button>
              <button *ngIf="p.connected" (click)="message(p)" class="px-3 py-1 rounded-md text-xs border" aria-label="Message {{p.name}}">Message</button>
              <button (click)="hidePerson(p)" class="text-[10px] px-2 py-1 border rounded" aria-label="Hide person">Hide</button>
              <button (click)="reportPerson(p)" class="text-[10px] px-2 py-1 border rounded text-red-600" aria-label="Report person">Report</button>
            </div>
          </div>
        </div>
      </details>
      <!-- Saved Searches -->
  <details [attr.open]="!isMobile ? true : null" class="card-white p-5 rail-section unified-feed-card" [class.snap-start]="isMobile" style="border-radius:14px;">
  <summary class="font-semibold text-lg mb-3 cursor-pointer flex items-center gap-2 text-gray-900">
          <!-- Bookmark icon -->
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4V3z" stroke="#3E8FFF" stroke-width="1.5" stroke-linejoin="round"/></svg>
          <span>Saved</span>
        </summary>
  <div *ngFor="let s of savedSearches; let i = index" class="flex items-center justify-between text-sm py-2 gap-2" [class.pulse-once]="s._pulse">
          <div class="min-w-0">
            <div class="truncate font-medium flex items-center gap-2" [title]="s.label">
              <!-- Bookmark icon small -->
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4V3z" stroke="#3E8FFF" stroke-width="1.3" stroke-linejoin="round"/></svg>
              <span>{{s.label}}</span>
            </div>
            <div class="text-[11px] text-gray-500">Updated {{relativeDays(s.updatedAt)}} ago</div>
          </div>
          <div class="flex items-center gap-1">
            <button (click)="openEdit(i)" class="text-xs px-2 py-1 border rounded focus-ring" aria-label="Edit saved search {{s.label}}">Edit</button>
            <button (click)="toggleSaved(s)" class="text-xs px-2 py-1 border rounded focus-ring" [class.btn-brand]="s.active" aria-label="Toggle saved search {{s.label}}">{{s.active ? 'Active' : 'Activate'}}</button>
          </div>
        </div>
      </details>
      <!-- Trust & Verification -->
  <details [attr.open]="!isMobile ? true : null" class="card-white p-5 rail-section unified-feed-card" [class.snap-start]="isMobile" style="border-radius:14px;">
  <summary class="font-semibold text-lg mb-1 cursor-pointer inline-flex items-center gap-2 text-gray-900">Trust
          <span class="text-gray-500" title="Your trust score improves how you appear in Connect. Complete verifications to boost it.">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="#9CA3AF" stroke-width="1.2"/><path d="M12 8v5" stroke="#9CA3AF" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="16" r="1" fill="#9CA3AF"/></svg>
          </span>
        </summary>
        <div class="flex items-center gap-4 mb-3">
          <app-progress-ring [value]="trustValue"></app-progress-ring>
          <div class="flex flex-wrap gap-2">
            <span *ngFor="let b of trustSteps" class="text-[10px] px-1.5 py-0.5 rounded-full border" [class.bg-green-50]="b.done" [class.text-green-700]="b.done" [class.border-green-200]="b.done" [class.text-gray-600]="!b.done" [class.border-gray-200]="!b.done">{{b.label.split(' ')[0]}}</span>
          </div>
        </div>
        <p class="text-xs text-gray-600 mb-2">Your profile helps others trust you. Add {{remainingVerifications()}} more verifications to reach 100%.</p>
        <ul class="space-y-1 text-xs">
          <li *ngFor="let step of trustSteps" class="flex items-center gap-2 cursor-pointer" (click)="onTrustClick(step)">
            <span class="w-3 h-3 rounded-full" [class.bg-blue-600]="step.done" [class.bg-gray-300]="!step.done"></span>
            <span>{{step.label}}</span>
          </li>
        </ul>
        <div class="mt-3">
          <button (click)="goVerification()" class="text-[11px] px-2 py-1 border rounded focus-ring" aria-label="Boost my Trust Score">Boost my Trust Score</button>
        </div>
      </details>
      <!-- Create Shortcut -->
  <div class="card-white p-3 rail-section" [class.snap-start]="isMobile">
        <button (click)="createRequested.emit()" class="btn-brand px-3 py-2 rounded-md text-sm">+ Create</button>
      </div>
      <!-- Weekly Digest -->
  <div class="card-white p-4 rail-section" [class.snap-start]="isMobile">
        <h3 class="font-medium mb-2">Weekly Digest</h3>
        <p class="text-xs text-gray-600 mb-3">Stay updated on verified rooms, rides, and Setly community stories.</p>
        <label class="inline-flex items-center gap-2 text-xs">
          <input type="checkbox" [checked]="digestOptIn" (change)="toggleDigest()" aria-label="Weekly digest opt in" />
          <span>{{digestOptIn ? 'Subscribed (Friday)' : 'Send me updates every Friday'}}</span>
        </label>
      </div>
      <!-- Setly Pulse -->
  <div class="card-white p-4 rail-section" [class.snap-start]="isMobile">
        <h3 class="font-medium mb-2 flex items-center gap-2">
          <span>Setly Pulse</span>
          <!-- Sparkle icon -->
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3l1.2 3.4L16.5 8 13.2 9.2 12 12.5 10.8 9.2 7.5 8l3.3-1.6L12 3z" stroke="#3E8FFF" stroke-width="1.2"/></svg>
        </h3>
        <ul class="text-xs space-y-2">
          <li *ngFor="let h of highlights" class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2 min-w-0">
              <span [innerHTML]="h.iconSafe || h.icon" aria-hidden="true"></span>
              <span class="truncate" [title]="h.title">{{h.title}}</span>
            </div>
            <span class="text-gray-500">{{h.metric}}</span>
          </li>
        </ul>
        <div class="mt-3">
          <svg *ngIf="sparkline.length" viewBox="0 0 120 28" height="28" width="120" fill="none" aria-hidden="true">
            <polyline [attr.points]="sparkline" stroke="#3E8FFF" stroke-width="1.5" fill="none" stroke-linejoin="round" stroke-linecap="round" />
          </svg>
        </div>
        <button (click)="onHighlightsViewed()" class="mt-3 text-[11px] px-2 py-1 border rounded focus-ring" aria-label="Refresh highlights">Refresh</button>
      </div>

      <!-- Edit Saved Search Modal -->
      <div *ngIf="editingIndex !== null" class="fixed inset-0 bg-black/30 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-label="Edit saved search">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-sm p-4">
          <h4 class="font-medium mb-2">Rename saved search</h4>
          <input type="text" class="w-full border rounded-md px-3 py-2 mb-3" [(ngModel)]="editingLabel" aria-label="Saved search name" />
          <div class="flex justify-end gap-2">
            <button (click)="cancelEdit()" class="px-3 py-1 border rounded focus-ring" aria-label="Cancel edit">Cancel</button>
            <button (click)="saveEdit()" class="btn-brand px-3 py-1 rounded focus-ring" aria-label="Save edit">Save</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes pulse-once {
  0% { box-shadow: 0 0 0 0 rgba(245,199,93,0.0); }
  50% { box-shadow: 0 0 0 6px rgba(245,199,93,0.25); }
  100% { box-shadow: 0 0 0 0 rgba(245,199,93,0.0); }
    }
    .pulse-once { animation: pulse-once 600ms ease-out; border-radius: 0.5rem; }
    .mobile-carousel { display: flex; flex-direction: row; gap: 1rem; overflow-x: auto; padding-bottom: 0.5rem; scroll-snap-type: x mandatory; }
    .mobile-carousel::-webkit-scrollbar { height: 8px; }
    .mobile-carousel::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 4px; }
    .rail-section { min-width: 250px; flex: 0 0 auto; }
    .snap-start { scroll-snap-align: start; }
  `]
})
export class ConnectRightRailComponent implements OnInit, OnDestroy {
  @Output() createRequested = new EventEmitter<void>();
  private toast = inject(ToastService);
  private analytics = inject(AnalyticsService);
  private router = inject(Router);
  private social = inject(ConnectSocialService);

  people: SuggestionPerson[] = [];
  savedSearches: SavedSearch[] = [];
  trustSteps = [
    { label: 'Email verified', done: true },
    { label: 'Phone verified', done: false },
    { label: 'University verified', done: false },
    { label: 'Profile photo', done: true }
  ];
  digestOptIn = false;
  editingIndex: number | null = null;
  editingLabel = '';
  trustValue = 0;
  get trustPct(){ const total = this.trustSteps.length; const done = this.trustSteps.filter(s => s.done).length; return (done/total) * 100; }
  highlights: Array<{ title: string; metric: string; icon?: string; iconSafe?: SafeHtml }> = [];
  sparkline: string = '';
  isMobile = false;
  private sanitizer = inject(DomSanitizer);

  ngOnInit(): void {
    // Seed local highlights with safe icons
    this.highlights = this.withSafeIcons([
      { title: 'Top verified hosts this week', metric: '5', icon: this.iconMedal() },
      { title: 'New Boston listings', metric: '12', icon: this.iconPin() },
      { title: 'Popular ride routes', metric: '3', icon: this.iconCar() }
    ]);
    // Animate trust ring from 0 to current percent
    setTimeout(() => this.trustValue = this.trustPct, 50);
    this.isMobile = window.matchMedia && window.matchMedia('(max-width: 1023px)').matches;
    // Update on resize
    window.addEventListener('resize', this.onResize);
    // Load social data
    this.social.getSuggestions().subscribe(list => this.people = list);
    this.social.getSavedSearches().subscribe(list => this.savedSearches = list);
  this.social.getPulse().subscribe(list => this.highlights = this.withSafeIcons(list as any));
    // periodic pulse refresh (30s)
    this.pulseInterval = window.setInterval(() => {
  this.social.getPulse().subscribe(list => this.highlights = this.withSafeIcons(list as any));
    }, 30000);
    this.generateSparkline();
  }
  private onResize = () => { this.isMobile = window.matchMedia && window.matchMedia('(max-width: 1023px)').matches; };
  private pulseInterval: any;
  ngOnDestroy(): void { window.removeEventListener('resize', this.onResize); if (this.pulseInterval) clearInterval(this.pulseInterval); }

  connect(p: SuggestionPerson){
    // Optimistic UI
    p.connected = true;
    this.social.connect(p.id).subscribe();
    this.toast.success(`You're now connected with ${p.name}. Start a chat?`);
    this.analytics.track('connect_clicked', { target: p.name });
  }
  message(p: any){ this.analytics.track('message_clicked', { target: p.name }); this.toast.info(`Messaging ${p.name}`); }
  hidePerson(p: any){ this.toast.info(`Hidden ${p.name}`); this.analytics.track('people_hide_clicked', { target: p.name }); }
  reportPerson(p: any){ this.toast.warning(`Reported ${p.name}`); this.analytics.track('people_report_clicked', { target: p.name }); }
  toggleSaved(s: SavedSearch){
    const next = !s.active;
    const prevLabel = s.label;
    // optimistic
    s.active = next;
    (s as any)._pulse = true; setTimeout(() => (s as any)._pulse = false, 650);
    s.updatedAt = new Date().toISOString();
    this.social.patchSavedSearch(s.id, { active: next }).subscribe();
    this.toast.info(`${s.active ? 'Activated' : 'Paused'} “${s.label}”`);
    this.analytics.track('saved_search_toggled', { label: prevLabel, active: next });
  }
  toggleDigest(){ this.digestOptIn = !this.digestOptIn; this.toast.success(this.digestOptIn ? 'Weekly digest enabled' : 'Weekly digest disabled'); this.analytics.track('weekly_digest_toggled', { enabled: this.digestOptIn }); }
  onTrustClick(step: any){ this.analytics.track('badge_clicked', { badge: step.label, done: step.done }); this.router.navigate(['/profile/verification']); }
  openEdit(i: number){ this.editingIndex = i; this.editingLabel = this.savedSearches[i].label; this.analytics.track('saved_search_edit_opened', { label: this.editingLabel }); }
  cancelEdit(){ this.editingIndex = null; this.editingLabel = ''; }
  saveEdit(){ if (this.editingIndex===null) return; const s = this.savedSearches[this.editingIndex]; const prev = s.label; s.label = this.editingLabel?.trim() || s.label; this.toast.success('Saved search renamed'); this.analytics.track('saved_search_renamed', { from: prev, to: s.label }); this.cancelEdit(); }
  onHighlightsViewed(){ this.analytics.track('highlights_viewed', { count: this.highlights.length }); this.toast.info('Highlights refreshed'); }

  remainingVerifications(){ return this.trustSteps.filter(s => !s.done).length; }
  relativeDays(date: Date | string){ const ms = Date.now() - new Date(date).getTime(); const days = Math.max(1, Math.floor(ms / (24*60*60*1000))); return days + ' day' + (days>1 ? 's' : ''); }

  // Inline SVG icon getters
  private iconMedal(){ return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="#3E8FFF" stroke-width="1.5"/><path d="M8 12l-2 8 6-3 6 3-2-8" stroke="#3E8FFF" stroke-width="1.5" stroke-linejoin="round"/></svg>'; }
  private iconPin(){ return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z" stroke="#3E8FFF" stroke-width="1.5"/><circle cx="12" cy="9" r="2" fill="#3E8FFF"/></svg>'; }
  private iconCar(){ return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 12l2-5h14l2 5v5H3v-5z" stroke="#3E8FFF" stroke-width="1.5"/><circle cx="7.5" cy="17" r="1.5" fill="#3E8FFF"/><circle cx="16.5" cy="17" r="1.5" fill="#3E8FFF"/></svg>'; }

  private generateSparkline(){
    // Mock mini trend: random ups/downs
    const pts: number[] = []; const steps = 12;
    let v = 10 + Math.random()*5;
    for (let i=0;i<steps;i++){ v += (Math.random()-0.5)*4; v = Math.max(4, Math.min(22, v)); pts.push(v); }
    // Normalize into 0..28 height
    const poly = pts.map((val,i) => `${(i/(steps-1))*120},${28 - (val/24)*26}` ).join(' ');
    this.sparkline = poly;
  }

  goVerification(){ this.router.navigate(['/profile/verification']); }

  private withSafeIcons(list: Array<any>): Array<any> {
    return (list || []).map(item => ({
      ...item,
      iconSafe: item.icon ? this.sanitizer.bypassSecurityTrustHtml(item.icon as string) as SafeHtml : undefined
    }));
  }
}
