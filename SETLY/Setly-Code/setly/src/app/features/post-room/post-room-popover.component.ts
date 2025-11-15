import { Component, inject, signal, HostListener, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostRoomStore } from './post-room.store';
import { ToastService } from '../../core/services/toast.service';
import { RoomsService } from '../../core/services/rooms.service';
import { RoomStore } from '../../core/state/room.store';
import { AnalyticsService } from '../../core/services/analytics.service';
import { CurrentUserService } from '../../core/user/current-user.service';
import { AddressAutocompleteComponent } from '../../shared/ui/address-autocomplete.component';
import { LocationAutocompleteComponent } from '../../shared/ui/location-autocomplete.component';

/**
 * Unified popover version of Post Room flow.
 * Combines all fields in a single scrollable surface with sectional navigation.
 */
@Component({
  selector: 'app-post-room-popover',
  standalone: true,
  imports: [CommonModule, FormsModule, AddressAutocompleteComponent, LocationAutocompleteComponent],
  template: `
  <div class="room-popover" role="dialog" aria-modal="true" aria-labelledby="prp-title" [class.compact]="isCompact()" tabindex="-1" #popoverRoot>
    <div class="room-popover-header">
      <h2 id="prp-title">Post Your Room</h2>
      <div class="flex items-center gap-2 density-toggle">
        <span class="text-xs text-gray-500">Density:</span>
        <button type="button" (click)="toggleDensity()" [attr.aria-pressed]="isCompact()" class="dt-btn">{{ isCompact() ? 'Compact' : 'Comfort' }}</button>
      </div>
      <button type="button" class="close-btn" (click)="close.emit()" aria-label="Close popover">✕</button>
    </div>
    <div class="room-popover-body">
      <nav class="section-nav" aria-label="Section navigation">
        <button *ngFor="let s of sections; let i = index" (click)="scrollTo(s.id)" class="nav-item" [class.active]="activeSection() === s.id">{{ s.label }}</button>
      </nav>
      <div class="content" (scroll)="onScroll($event)">
        <!-- Basics -->
        <section id="sec-basics" class="form-section" aria-labelledby="sec-basics-h">
          <h3 id="sec-basics-h" class="section-title">Basics</h3>
          <div class="grid gap-4">
            <div class="form-group">
              <label class="form-label" for="title">Room Title *</label>
              <input id="title" class="form-input" [(ngModel)]="draft.title" (ngModelChange)="onDraftChange({ title: draft.title })" maxlength="80" placeholder="e.g., Cozy Room Near Campus" />
            </div>
            <div class="form-group">
              <label class="form-label" for="description">Description *</label>
              <textarea id="description" class="form-input" rows="5" [(ngModel)]="draft.description" (ngModelChange)="onDraftChange({ description: draft.description })" placeholder="Describe your room, amenities, neighborhood, and what makes it special..." maxlength="1200"></textarea>
            </div>
          </div>
        </section>

        <!-- Location -->
        <section id="sec-location" class="form-section" aria-labelledby="sec-location-h">
          <h3 id="sec-location-h" class="section-title">Location</h3>
          <div class="grid md:grid-cols-2 gap-4">
            <div class="form-group">
              <label class="form-label" for="city">City *</label>
              <input id="city" class="form-input" [(ngModel)]="draft.city" (ngModelChange)="onDraftChange({ city: draft.city })" />
            </div>
            <div class="form-group">
              <label class="form-label" for="state">State *</label>
              <select id="state" class="form-input" [(ngModel)]="draft.state" (ngModelChange)="onDraftChange({ state: draft.state })">
                <option value="">Select State</option>
                <option *ngFor="let st of usStates" [value]="st.code">{{ st.name }}</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="address">Address *</label>
            <app-address-autocomplete (picked)="onAddressPicked($event)" [biasCity]="draft.city" [biasState]="draft.state" [placeholder]="draft.city && draft.state ? 'Street address' : 'Select city & state first'"></app-address-autocomplete>
          </div>
          <div class="form-group">
            <label class="form-label" for="university">Near University *</label>
            <input id="university" class="form-input" [(ngModel)]="uniQuery" (input)="onUniversitySearch($any($event.target).value)" (blur)="hideUniLater()" placeholder="Start typing university name..." />
            <ul *ngIf="showUniSuggestions && universitySuggestions().length" class="autocomplete">
              <li *ngFor="let u of universitySuggestions(); track u.id" (mousedown)="selectUniversity(u)" class="auto-item">
                <span class="font-medium">{{ u.name }}</span>
                <span class="text-xs text-gray-500 ml-1">{{ u.city }}, {{ u.state }}</span>
              </li>
            </ul>
          </div>
        </section>

        <!-- Attributes -->
        <section id="sec-attributes" class="form-section" aria-labelledby="sec-attributes-h">
          <h3 id="sec-attributes-h" class="section-title">Attributes</h3>
          <div class="grid md:grid-cols-2 gap-3">
            <div class="radio-card" [class.selected]="draft.roomType==='private'" (click)="setRoomType('private')">
              <div class="rc-title">Private Room</div><div class="rc-sub">Your own space</div>
            </div>
            <div class="radio-card" [class.selected]="draft.roomType==='shared'" (click)="setRoomType('shared')">
              <div class="rc-title">Shared Room</div><div class="rc-sub">With roommates</div>
            </div>
            <div class="radio-card" [class.selected]="draft.bath==='private'" (click)="setBath('private')">
              <div class="rc-title">Private Bath</div><div class="rc-sub">Ensuite</div>
            </div>
            <div class="radio-card" [class.selected]="draft.bath==='shared'" (click)="setBath('shared')">
              <div class="rc-title">Shared Bath</div><div class="rc-sub">Common</div>
            </div>
          </div>
          <div class="form-group mt-4 flex items-center justify-between">
            <label class="form-label mb-0">Furnished</label>
            <label class="switch">
              <input type="checkbox" [(ngModel)]="draft.furnished" (ngModelChange)="onDraftChange({ furnished: draft.furnished })" />
              <span class="slider"></span>
            </label>
          </div>
          <div class="form-group">
            <label class="form-label" for="distance">Distance from Campus (miles)</label>
            <input id="distance" type="number" min="0" max="50" step="0.1" class="form-input" [(ngModel)]="draft.distanceMiles" (ngModelChange)="onDraftChange({ distanceMiles: draft.distanceMiles })" />
          </div>
          <div class="form-group">
            <button type="button" class="collapse-btn" (click)="toggleRules()">
              House Rules <span class="count" *ngIf="selectedRulesCount()">({{ selectedRulesCount() }} selected)</span>
              <svg class="chevron" [class.open]="showRules()" viewBox="0 0 20 20" fill="none" stroke="currentColor"><path d="M6 8l4 4 4-4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
            </button>
            <div *ngIf="showRules()" class="rules-grid">
              <label class="rule-item"><input type="checkbox" [(ngModel)]="draft.rules.vegetarian" (ngModelChange)="onDraftChange({ rules: draft.rules })" /> Vegetarian household</label>
              <label class="rule-item"><input type="checkbox" [(ngModel)]="draft.rules.smoking" (ngModelChange)="onDraftChange({ rules: draft.rules })" /> No smoking</label>
              <label class="rule-item"><input type="checkbox" [(ngModel)]="draft.rules.petsOk" (ngModelChange)="onDraftChange({ rules: draft.rules })" /> Pets allowed</label>
            </div>
          </div>
        </section>

        <!-- Photos -->
        <section id="sec-photos" class="form-section" aria-labelledby="sec-photos-h">
          <h3 id="sec-photos-h" class="section-title">Photos</h3>
          <div class="photo-drop" (click)="fileInput.click()" data-testid="prp-drop">
            <input #fileInput type="file" class="hidden" multiple accept="image/*,.heic,.heif" (change)="onFileSelect($event)" />
            <p class="text-sm text-gray-600">Click to upload (min 3, max 12)</p>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4" *ngIf="draft.photos.length">
            <div *ngFor="let p of draft.photos; let i = index" class="photo-item" [class.cover]="p.isCover">
              <img [src]="p.preview" alt="Room photo" />
              <div class="photo-actions">
                <button type="button" class="btn-mini" (click)="setCover(i)" *ngIf="!p.isCover">Cover</button>
                <button type="button" class="btn-mini danger" (click)="removePhoto(i)">✕</button>
              </div>
              <div class="cover-badge" *ngIf="p.isCover">Cover</div>
            </div>
          </div>
          <p class="text-xs text-red-600 mt-2" *ngIf="draft.photos.length < 3">{{ draft.photos.length }}/3 photos</p>
        </section>

        <!-- Pricing & Availability -->
        <section id="sec-pricing" class="form-section" aria-labelledby="sec-pricing-h">
          <h3 id="sec-pricing-h" class="section-title">Pricing & Availability</h3>
          <div class="grid md:grid-cols-2 gap-4">
            <div class="form-group">
              <label class="form-label" for="monthly">Monthly Rent ($)*</label>
              <input id="monthly" type="number" class="form-input" [(ngModel)]="draft.price.monthly" (ngModelChange)="onDraftChange({ price: draft.price })" min="100" max="5000" placeholder="1200" />
            </div>
            <div class="form-group">
              <label class="form-label" for="deposit">Security Deposit ($)</label>
              <input id="deposit" type="number" class="form-input" [(ngModel)]="draft.price.deposit" (ngModelChange)="onDraftChange({ price: draft.price })" min="0" placeholder="500" />
            </div>
            <div class="form-group">
              <label class="form-label" for="minStay">Min Stay (months)</label>
              <input id="minStay" type="number" class="form-input" [(ngModel)]="draft.price.minStayMonths" (ngModelChange)="onDraftChange({ price: draft.price })" min="1" max="12" placeholder="3" />
            </div>
            <div class="form-group">
              <label class="form-label" for="utilities">Utilities Included</label>
              <div class="utilities">
                <label *ngFor="let util of utilities" class="util-chip" [class.selected]="draft.price.utilitiesIncluded.includes(util)" (click)="toggleUtility(util)">{{ util }}</label>
              </div>
            </div>
          </div>
          <div class="grid md:grid-cols-2 gap-4 mt-2">
            <div class="form-group">
              <label class="form-label" for="availableFrom">Available From *</label>
              <input id="availableFrom" type="date" class="form-input" [(ngModel)]="draft.availableFrom" (ngModelChange)="onDraftChange({ availableFrom: draft.availableFrom })" />
            </div>
            <div class="form-group">
              <label class="form-label" for="availableTo">Available To</label>
              <input id="availableTo" type="date" class="form-input" [(ngModel)]="draft.availableTo" (ngModelChange)="onDraftChange({ availableTo: draft.availableTo })" />
            </div>
          </div>
          <div class="form-group mt-2">
            <label class="form-label" for="note">Note to Tenants</label>
            <textarea id="note" rows="3" class="form-input" [(ngModel)]="draft.noteToTenants" (ngModelChange)="onDraftChange({ noteToTenants: draft.noteToTenants })" maxlength="240" placeholder="Optional message..."></textarea>
            <div class="text-right text-xs text-gray-500 mt-1">{{ draft.noteToTenants.length }}/240</div>
          </div>
        </section>

        <!-- Publish -->
        <section id="sec-publish" class="form-section" aria-labelledby="sec-publish-h">
          <h3 id="sec-publish-h" class="section-title">Publish</h3>
          <div class="summary">
            <div><span class="label">Monthly:</span> <span>{{ draft.price.monthly ? '$'+draft.price.monthly : '—' }}</span></div>
            <div><span class="label">Deposit:</span> <span>{{ draft.price.deposit || '—' }}</span></div>
            <div><span class="label">Photos:</span> <span>{{ draft.photos.length }}</span></div>
          </div>
          <div class="actions">
            <button type="button" class="btn-secondary" (click)="close.emit()">Cancel</button>
            <button type="button" class="btn-primary" (click)="publishRoom()" [disabled]="!allValid()" data-testid="prp-publish">Publish Listing</button>
          </div>
        </section>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .room-popover { position:fixed; bottom:90px; right:30px; width:clamp(340px, 38vw, 600px); max-height:70vh; background:#fff; border:1px solid #e2e8f0; border-radius:20px; box-shadow:0 20px 50px -15px rgba(0,0,0,0.25); display:flex; flex-direction:column; overflow:hidden; font-size:14px; }
    .room-popover.compact { font-size:13px; }
    .room-popover-header { display:flex; align-items:center; gap:12px; padding:10px 16px; border-bottom:1px solid #e2e8f0; background:linear-gradient(90deg,#ffffff,#f8fafc); }
    .room-popover-header h2 { flex:1; font-size:18px; font-weight:600; margin:0; }
    .close-btn { background:none; border:none; font-size:20px; cursor:pointer; color:#64748b; }
    .room-popover-body { display:flex; height:100%; }
    .section-nav { width:84px; flex-shrink:0; display:flex; flex-direction:column; padding:8px 6px; gap:4px; background:#f8fafc; border-right:1px solid #e2e8f0; overflow-y:auto; }
    .nav-item { background:none; border:none; text-align:left; padding:6px 8px; border-radius:8px; font-size:11px; line-height:1.2; cursor:pointer; color:#475569; }
    .nav-item.active, .nav-item:hover { background:#eef2ff; color:#1e293b; }
    .content { flex:1; overflow-y:auto; padding:14px 18px 18px; scroll-behavior:smooth; }
    .form-section + .form-section { margin-top:26px; }
    .section-title { font-size:13px; font-weight:700; letter-spacing:.5px; text-transform:uppercase; margin:0 0 10px; color:#334155; }
    .compact .section-title { font-size:12px; margin-bottom:8px; }
    .form-group { margin-bottom:14px; }
    .form-label { display:block; font-weight:600; margin-bottom:4px; color:#374151; font-size:12px; }
    .form-input { width:100%; border:1px solid #d1d5db; border-radius:10px; padding:10px 12px; font-size:13px; background:#fff; transition:border .2s, box-shadow .2s; }
    .form-input:focus { outline:none; border-color:#6366f1; box-shadow:0 0 0 3px rgba(99,102,241,0.15); }
    .compact .form-input { padding:8px 10px; border-radius:8px; font-size:12px; }
    textarea.form-input { resize:vertical; line-height:1.45; }
    .compact textarea.form-input { line-height:1.35; }

    .radio-card { border:1.5px solid #e2e8f0; border-radius:12px; padding:10px 10px; cursor:pointer; text-align:left; background:#fff; transition:background .2s,border .2s; font-size:12px; }
    .radio-card.selected { border-color:#6366f1; background:#eef2ff; }
    .rc-title { font-weight:600; font-size:13px; }
    .rc-sub { font-size:11px; color:#64748b; }
    .compact .radio-card { padding:8px 8px; border-radius:10px; }

    .switch { position:relative; display:inline-block; width:44px; height:24px; }
    .switch input { opacity:0; width:0; height:0; }
    .slider { position:absolute; cursor:pointer; top:0; left:0; right:0; bottom:0; background:#cbd5e1; border-radius:24px; transition:.25s; }
    .slider:before { position:absolute; content:''; height:18px; width:18px; left:3px; top:3px; background:#fff; border-radius:50%; transition:.25s; box-shadow:0 2px 4px rgba(0,0,0,.15); }
    .switch input:checked + .slider { background:#6366f1; }
    .switch input:checked + .slider:before { transform:translateX(20px); }

    .collapse-btn { width:100%; display:flex; align-items:center; justify-content:space-between; background:#f1f5f9; border:1px solid #e2e8f0; padding:8px 10px; border-radius:10px; font-size:12px; cursor:pointer; font-weight:500; }
    .collapse-btn:hover { background:#e2e8f0; }
    .chevron { width:14px; height:14px; transition:transform .2s; }
    .chevron.open { transform:rotate(180deg); }
    .rules-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(140px,1fr)); gap:6px; margin-top:8px; }
    .rule-item { font-size:11px; display:flex; align-items:center; gap:6px; background:#fff; border:1px solid #e2e8f0; padding:6px 8px; border-radius:8px; }

    .photo-drop { border:2px dashed #cbd5e1; border-radius:14px; padding:26px; text-align:center; cursor:pointer; background:#f8fafc; }
    .photo-drop:hover { background:#eef2ff; }
    .compact .photo-drop { padding:18px; border-radius:12px; }
    .photo-item { position:relative; border:1px solid #e2e8f0; border-radius:12px; overflow:hidden; aspect-ratio:1/1; }
    .photo-item img { width:100%; height:100%; object-fit:cover; }
    .photo-actions { position:absolute; top:4px; right:4px; display:flex; gap:4px; }
    .btn-mini { background:#fff; border:1px solid #cbd5e1; font-size:10px; padding:3px 6px; border-radius:6px; cursor:pointer; }
    .btn-mini:hover { background:#f1f5f9; }
    .btn-mini.danger { color:#dc2626; border-color:#dc2626; }
    .cover-badge { position:absolute; bottom:4px; left:4px; background:#6366f1; color:#fff; font-size:10px; padding:3px 6px; border-radius:6px; }

    .utilities { display:flex; flex-wrap:wrap; gap:6px; }
    .util-chip { background:#f1f5f9; border:1px solid #e2e8f0; padding:6px 10px; border-radius:20px; font-size:11px; cursor:pointer; transition:.2s; }
    .util-chip.selected { background:#6366f1; color:#fff; border-color:#6366f1; }
    .compact .util-chip { padding:5px 8px; font-size:10px; }

    .summary { display:grid; grid-template-columns:repeat(auto-fit,minmax(120px,1fr)); gap:8px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:10px; font-size:12px; margin-bottom:12px; }
    .summary .label { color:#64748b; }
    .actions { display:flex; justify-content:flex-end; gap:10px; }
    .btn-primary { background:linear-gradient(135deg,#3b82f6,#6366f1); color:#fff; border:none; padding:10px 18px; font-size:13px; font-weight:600; border-radius:10px; cursor:pointer; box-shadow:0 8px 18px -6px rgba(99,102,241,.35); }
    .btn-primary:disabled { opacity:.5; cursor:not-allowed; }
    .btn-secondary { background:#fff; border:1.5px solid #6366f1; color:#0f172a; padding:10px 16px; font-size:13px; font-weight:600; border-radius:10px; cursor:pointer; }
    .btn-secondary:hover { background:#f1f5f9; }
    .dt-btn { background:#fff; border:1px solid #cbd5e1; padding:4px 8px; font-size:11px; border-radius:6px; cursor:pointer; }
    .dt-btn:hover { background:#f1f5f9; }

    @media (max-width:640px){
      .room-popover { right:12px; bottom:80px; width:92vw; max-height:75vh; }
      .section-nav { display:none; }
      .content { padding:14px 14px 70px; }
    }
  `]
})
export class PostRoomPopoverComponent {
  store = inject(PostRoomStore);
  private roomsService = inject(RoomsService);
  private analytics = inject(AnalyticsService);
  private currentUserService = inject(CurrentUserService);
  private toast = inject(ToastService);
  private roomCardStore = inject(RoomStore);

  isCompact = signal(false);
  showRules = signal(false);

  sections = [
    { id: 'sec-basics', label: 'Basics' },
    { id: 'sec-location', label: 'Location' },
    { id: 'sec-attributes', label: 'Attributes' },
    { id: 'sec-photos', label: 'Photos' },
    { id: 'sec-pricing', label: 'Pricing' },
    { id: 'sec-publish', label: 'Publish' }
  ];
  activeSection = signal('sec-basics');

  draft = this.store.draft();
  uniQuery = '';
  showUniSuggestions = false;
  universitySuggestions = signal<any[]>([]); // simplified typing for brevity
  utilities = ['Electricity','Water','Gas','Internet','Heating','Cable TV'];

  usStates = [] as Array<{ code:string; name:string }>;

  // Outputs
  @Output() close = new EventEmitter<void>();

  ngOnInit() {
    import('../../shared/constants/us-states').then(mod => { this.usStates = mod.US_STATES; });
    const saved = localStorage.getItem('postRoomDensity');
    if (saved === 'compact') this.isCompact.set(true);
  }

  toggleDensity(){
    this.isCompact.update(v => { const next = !v; localStorage.setItem('postRoomDensity', next?'compact':'comfort'); return next; });
  }

  onDraftChange(patch: any){ this.store.updateDraft(patch); }
  setRoomType(t: 'private'|'shared'){ this.store.updateDraft({ roomType: t }); }
  setBath(t: 'private'|'shared'){ this.store.updateDraft({ bath: t }); }
  toggleRules(){ this.showRules.update(v => !v); }
  selectedRulesCount(){ const r = this.store.draft().rules; return [r.vegetarian,r.smoking,r.petsOk].filter(Boolean).length; }

  onFileSelect(event: Event){
    const input = event.target as HTMLInputElement; if(!input.files) return;
    Array.from(input.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        this.store.addPhoto({ key: 'temp-'+Date.now(), preview: e.target?.result as string, file, isCover: this.store.draft().photos.length===0 });
      };
      reader.readAsDataURL(file);
    });
    this.toast.success('Photos added');
  }
  setCover(i:number){ this.store.setCoverPhoto(i); }
  removePhoto(i:number){ this.store.removePhoto(i); }

  toggleUtility(u:string){
    const utilities = [...this.store.draft().price.utilitiesIncluded];
    const idx = utilities.indexOf(u); if(idx>-1) utilities.splice(idx,1); else utilities.push(u);
    this.store.updateDraft({ price: { ...this.store.draft().price, utilitiesIncluded: utilities } });
  }

  onAddressPicked(addr: any){
    this.store.updateDraft({ address: addr.address, city: addr.city || this.store.draft().city, state: addr.state || this.store.draft().state, lat: addr.lat, lon: addr.lon });
  }

  async onUniversitySearch(query: string){
    this.uniQuery = query;
    if(query.length < 2){ this.universitySuggestions.set([]); return; }
    const svc = await import('../../core/services/university.service');
    const usvc = inject(svc.UniversityService); // dynamic usage
    this.universitySuggestions.set(usvc.search(query));
    this.showUniSuggestions = true;
  }
  hideUniLater(){ setTimeout(()=> this.showUniSuggestions = false,200); }
  selectUniversity(uni:any){ this.store.updateDraft({ nearUniversityId: uni.id }); this.uniQuery = uni.name; this.showUniSuggestions=false; }

  scrollTo(id:string){ document.getElementById(id)?.scrollIntoView({ behavior:'smooth', block:'start' }); }
  onScroll(e:Event){
    const container = e.target as HTMLElement;
    const sections = this.sections.map(s => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const top = container.scrollTop;
    let current = 'sec-basics';
    for(const sec of sections){ if(sec.offsetTop - top <= 60) current = sec.id; }
    this.activeSection.set(current);
  }

  allValid(){ return this.store.allStepsValid(); }

  async publishRoom(){
    if(!this.allValid()){ this.toast.error('Please complete required fields and minimum photos.'); return; }
    try {
      const currentUser = this.currentUserService.currentUser();
      if(!currentUser){ this.toast.error('Login required'); return; }
      const draft:any = this.store.draft();
      const photos = draft.photos.filter((p:any)=> (p.preview||p.url) && !p.error).map((p:any)=> p.preview || p.url || p.key);
      const cover = draft.photos.find((p:any)=> p.isCover);
      const roomData:any = { title:draft.title, description:draft.description, address:draft.address, lat:draft.lat, lon:draft.lon, city:draft.city, state:draft.state, universityId:draft.nearUniversityId, roomType:draft.roomType, bath:draft.bath, furnished:draft.furnished, rules:draft.rules, distanceKm: draft.distanceMiles ? Math.round((draft.distanceMiles*1.60934)*10)/10 : undefined, photos, image: cover ? (cover.preview||cover.url||cover.key) : photos[0], hostId: currentUser.uid, createdAt: new Date().toISOString(), availabilityStart:draft.availableFrom, availabilityEnd:draft.availableTo, amenities:draft.price.utilitiesIncluded, price:draft.price.monthly };
      const created = await inject(RoomsService).create(roomData).toPromise();
      if(created){
        const features:string[] = [];
        if(created.roomType==='private') features.push('Private room');
        if(created.furnished) features.push('Furnished');
        if(created.rules?.petsOk) features.push('Pets ok');
        if(!created.rules?.smoking) features.push('No smoking');
        if(created.rules?.vegetarian) features.push('Vegetarian');
        this.roomCardStore.addRoom({ id: created.id, title: created.title, price: created.price, image: created.image||created.photos?.[0]||'/assets/placeholder-room.jpg', address:[created.city, created.state].filter(Boolean).join(', '), distance: created.distanceKm? created.distanceKm+' km':'', features, isAvailable:true });
        this.store.clearDraft();
        this.analytics.trackEvent('postRoom_published', { listingId: created.id, city: draft.city, universityId: draft.nearUniversityId, price: draft.price.monthly });
        this.toast.success('Your room is live!');
        window.dispatchEvent(new CustomEvent('roomPosted'));
      } else {
        this.toast.error('Failed to publish listing');
      }
    } catch(err){ console.error(err); this.toast.error('Publish failed.'); }
  }

  @HostListener('keydown.escape') onEsc(){ this.close.emit(); }
}
