import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { RoomsSearchFormComponent } from './rooms-search-form.component';
import { RoomsPostFormComponent } from './rooms-post-form.component';
import { RidesSearchFormComponent } from './rides-search-form.component';
import { RidesPostFormComponent } from './rides-post-form.component';
import { MarketSearchFormComponent } from './market-search-form.component';
import { MarketPostFormComponent } from './market-post-form.component';

const minArrayLength = (min: number): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    const length = Array.isArray(value) ? value.length : 0;
    return length >= min ? null : { minArrayLength: { requiredLength: min, actualLength: length } };
  };
};

@Component({
  selector: 'app-explore-form-card',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RoomsSearchFormComponent, RoomsPostFormComponent, RidesSearchFormComponent, RidesPostFormComponent, MarketSearchFormComponent, MarketPostFormComponent],
  template: `
    <div class="card-shell">
      <div class="card-inner">
        <div class="mode-toggle">
          <div class="toggle-pill">
            <button type="button" class="toggle-btn" [class.active]="mode() === 'search'" (click)="setMode('search')">Search</button>
            <button type="button" class="toggle-btn" [class.active]="mode() === 'post'" (click)="setMode('post')">Post</button>
          </div>
        </div>
        <div class="form-body fade-switch" [attr.data-mode]="mode()">
        <ng-container *ngIf="tab === 'rooms' && mode() === 'search'">
          <app-rooms-search-form [form]="roomsSearchForm" />
        </ng-container>
        <ng-container *ngIf="tab === 'rooms' && mode() === 'post'">
          <app-rooms-post-form [form]="roomsPostForm" />
        </ng-container>
        <ng-container *ngIf="tab === 'rides' && mode() === 'search'">
          <app-rides-search-form [form]="ridesSearchForm" />
        </ng-container>
        <ng-container *ngIf="tab === 'rides' && mode() === 'post'">
          <app-rides-post-form [form]="ridesPostForm" />
        </ng-container>
        <ng-container *ngIf="tab === 'market' && mode() === 'search'">
          <app-market-search-form [form]="marketSearchForm" />
        </ng-container>
        <ng-container *ngIf="tab === 'market' && mode() === 'post'">
          <app-market-post-form [form]="marketPostForm" />
        </ng-container>
        </div>
        <div class="cta-row">
          <button class="form-main-btn" [disabled]="loading()" (click)="submit()">
            <span *ngIf="!loading()">{{ mainButtonLabel() }}</span>
            <span *ngIf="loading()" class="loading-dots">{{ mainButtonLabel() }}</span>
          </button>
        </div>
        <p *ngIf="error()" class="error-text">{{ error() }}</p>
      </div>
    </div>
  `,
  styles: [`
    .card-shell {
      width: 100%;
      max-width: 960px;
      margin: 0 auto;
      background: linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,255,255,0.88));
      border-radius: 28px;
      border: 1px solid rgba(226, 232, 240, 0.62);
      box-shadow: 0 18px 44px -26px rgba(15,23,42,0.28);
      padding: clamp(26px, 3vw, 32px);
    }
    .card-inner {
      width: min(100%, 760px);
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .mode-toggle { display: flex; justify-content: center; }
    .toggle-pill {
      display: inline-flex;
      padding: 4px;
      border-radius: 999px;
      background: rgba(99,102,241,0.08);
      border: 1px solid rgba(99,102,241,0.15);
      gap: 6px;
    }
    .toggle-btn {
      min-width: 110px;
      padding: 9px 18px;
      border-radius: 999px;
      border: none;
      background: transparent;
      color: #4b5563;
      font-weight: 600;
      font-size: 0.95rem;
      transition: background .2s, color .2s, box-shadow .2s;
      cursor: pointer;
    }
    .toggle-btn.active {
      background: #ede9fe;
      color: #312e81;
      box-shadow: 0 8px 16px -10px rgba(79,70,229,0.45);
    }
    .toggle-btn:focus-visible {
      outline: 2px solid rgba(99,102,241,0.5);
      outline-offset: 2px;
    }
    .form-body { display: flex; flex-direction: column; gap: 24px; }
    .fade-switch { transition: opacity .22s; }
  .cta-row { display:flex; justify-content:center; margin-top: 12px; }
    .form-main-btn {
      border-radius: 999px;
      background: linear-gradient(90deg, #3A7AFE 0%, #8B5CF6 100%);
      color: #fff;
      border: none;
      box-shadow: 0 12px 30px -18px rgba(58,122,254,0.8);
      font-weight: 700;
      font-size: 1rem;
      letter-spacing: 0.01em;
      padding: 14px 36px;
      min-width: 220px;
      transition: transform .2s, box-shadow .2s;
    }
    .form-main-btn:hover { transform: translateY(-1px); box-shadow: 0 18px 36px -18px rgba(58,122,254,0.9); }
    .form-main-btn:active { transform: translateY(0); }
    .form-main-btn[disabled] { opacity:0.6; cursor:not-allowed; transform:none; box-shadow:0 12px 30px -22px rgba(58,122,254,0.6); }
    .error-text { text-align:center; font-size:0.85rem; color:#e11d48; }
    @media (max-width: 900px) {
      .card-shell { padding: 24px; border-radius: 24px; }
      .card-inner { gap: 22px; }
      .toggle-btn { min-width: 100px; font-size: 0.9rem; }
    }
    @media (max-width: 640px) {
      .card-shell { padding: 22px 18px; border-radius: 22px; }
      .card-inner { gap: 20px; }
      .form-body { gap: 20px; }
      .form-main-btn { width: 100%; min-width: 0; }
    }
  `]
})
export class ExploreFormCardComponent {
  @Input() tab: 'rooms' | 'rides' | 'market' = 'rooms';
  @Output() action = new EventEmitter<{ tab: 'rooms' | 'rides' | 'market'; mode: 'search' | 'post'; payload: any }>();
  mode = signal<'search' | 'post'>('search');
  loading = signal(false);
  error = signal('');
  private lastMode: Record<string, 'search' | 'post'> = { rooms: 'search', rides: 'search', market: 'search' };

  roomsSearchForm: FormGroup;
  roomsPostForm: FormGroup;
  ridesSearchForm: FormGroup;
  ridesPostForm: FormGroup;
  marketSearchForm: FormGroup;
  marketPostForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.roomsSearchForm = this.fb.group({
      location: ['', Validators.required],
      checkIn: ['', Validators.required],
      checkOut: ['', Validators.required],
      roomType: ['shared', Validators.required]
    });
    this.roomsPostForm = this.fb.group({
      city: ['', Validators.required],
      state: [''],
      cityLat: [null],
      cityLon: [null],
      address: ['', Validators.required],
      addressLat: [null],
      addressLon: [null],
      roomType: ['shared', Validators.required],
      price: [null, [Validators.required, Validators.min(50)]],
      amenities: [[], [minArrayLength(1)]],
      description: [''],
      photos: [[], [minArrayLength(3)]]
    });
    this.ridesSearchForm = this.fb.group({
      pickup: ['', Validators.required],
      destination: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      seats: [1, [Validators.required, Validators.min(1), Validators.max(4)]]
    });
    this.ridesPostForm = this.fb.group({
      pickup: ['', Validators.required],
      destination: ['', Validators.required],
      departure: ['', Validators.required],
      seatsAvailable: [1, [Validators.required, Validators.min(1), Validators.max(4)]],
      luggage: [false],
      notes: ['']
    });
    this.marketSearchForm = this.fb.group({
      term: ['', Validators.required],
      category: [''],
      priceRange: [''],
      location: ['']
    });
    this.marketPostForm = this.fb.group({
      title: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0)]],
  photos: [[], Validators.required],
      condition: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]],
      category: ['', Validators.required],
      location: ['', Validators.required]
    });
  }

  setMode(m: 'search' | 'post') {
    this.mode.set(m);
    this.lastMode[this.tab] = m;
  }
  ngOnChanges() {
    this.mode.set(this.lastMode[this.tab] || 'search');
  }
  mainButtonLabel = computed(() => {
    if (this.mode() === 'search') {
      if (this.tab === 'rooms') return 'Search Rooms';
      if (this.tab === 'rides') return 'Search Rides';
      return 'Search Items';
    }
    if (this.tab === 'rooms') return 'Post Room';
    if (this.tab === 'rides') return 'Post Ride';
    return 'Post Item';
  });

  private currentForm(): FormGroup {
    if (this.tab === 'rooms') return this.mode() === 'search' ? this.roomsSearchForm : this.roomsPostForm;
    if (this.tab === 'rides') return this.mode() === 'search' ? this.ridesSearchForm : this.ridesPostForm;
    return this.mode() === 'search' ? this.marketSearchForm : this.marketPostForm;
  }

  submit() {
    const form = this.currentForm();
    if (!form) return;
    this.error.set('');
    if (form.invalid) {
      form.markAllAsTouched();
      this.error.set('Please complete the highlighted fields.');
      return;
    }
    this.loading.set(true);
    const payload = form.getRawValue();
    this.action.emit({ tab: this.tab, mode: this.mode(), payload });
    this.loading.set(false);
  }
}
