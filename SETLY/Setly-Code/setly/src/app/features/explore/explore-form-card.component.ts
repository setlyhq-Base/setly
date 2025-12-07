import { Component, Input, Output, EventEmitter, signal, computed, inject, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { UploadsService } from '../../core/services/uploads.service';
import { RoomsService } from '../../core/services/rooms.service';
import { CurrentUserService } from '../../core/user/current-user.service';
import { ToastService } from '../../core/services/toast.service';
import { RoomStore } from '../../core/state/room.store';
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
    <div class="card-shell" [ngClass]="'tab-' + tab">
      <!-- 🎨 Glassmorphic overlay for premium depth -->
      <div class="card-overlay"></div>
      
      <div class="card-inner">
        <!-- ✨ Premium Mode Toggle with Gradient -->
        <div class="mode-toggle">
          <div class="toggle-container">
            <button 
              type="button" 
              class="toggle-btn" 
              [class.active]="mode() === 'search'" 
              (click)="setMode('search')">
              <svg class="toggle-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
                <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <span>Search</span>
            </button>
            <button 
              type="button" 
              class="toggle-btn" 
              [class.active]="mode() === 'post'" 
              (click)="setMode('post')">
              <svg class="toggle-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <span>Post</span>
            </button>
            <div class="toggle-slider" [class.post-active]="mode() === 'post'"></div>
          </div>
        </div>

        <!-- 📋 Form Body with Smooth Transitions -->
        <div class="form-body" [attr.data-mode]="mode()">
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

        <!-- 📤 Upload Progress Section -->
        <div *ngIf="uploadProgress().length > 0" class="upload-progress-section">
          <h4 class="upload-progress-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Upload Progress
          </h4>
          <div class="upload-progress-list">
            <div *ngFor="let upload of uploadProgress()" class="upload-progress-item">
              <div class="upload-file-info">
                <span class="upload-filename">{{ upload.filename }}</span>
                <span class="upload-status" [class]="'status-' + upload.status">{{ upload.status }}</span>
              </div>
              <div *ngIf="upload.status === 'uploading'" class="upload-progress-bar">
                <div class="progress-fill" [style.width.%]="upload.progress || 0"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 🚀 Premium CTA Button -->
        <div class="cta-row">
          <button class="form-main-btn" [disabled]="loading()" (click)="submit()">
            <span class="btn-content" *ngIf="!loading()">
              <svg class="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              {{ mainButtonLabel() }}
            </span>
            <span class="btn-content loading" *ngIf="loading()">
              <svg class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity="0.25"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
              </svg>
              {{ mainButtonLabel() }}
            </span>
          </button>
        </div>

        <!-- ⚠️ Error Message -->
        <p *ngIf="error()" class="error-text">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          {{ error() }}
        </p>
      </div>
    </div>
  `,
  styles: [`
    /* 🎨 Premium Card Shell with Enhanced Glassmorphism */
    .card-shell {
      width: 100%;
      max-width: 960px;
      margin: 0 auto;
      position: relative;
      background: 
        linear-gradient(135deg, 
          rgba(255, 255, 255, 0.98) 0%, 
          rgba(248, 250, 255, 0.95) 100%
        );
      border-radius: 36px;
      border: 1px solid rgba(226, 232, 240, 0.6);
      box-shadow: 
        0 24px 70px -15px rgba(62, 143, 255, 0.18),
        0 12px 32px -12px rgba(10, 26, 63, 0.08),
        0 4px 12px rgba(0, 0, 0, 0.03),
        inset 0 1px 0 rgba(255, 255, 255, 0.95),
        inset 0 -1px 0 rgba(0, 0, 0, 0.02);
      padding: clamp(32px, 4.5vw, 48px);
      overflow: hidden;
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      animation: cardSlideUp 0.8s cubic-bezier(0.4, 0, 0.2, 1);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }
    
    @keyframes cardSlideUp {
      from {
        opacity: 0;
        transform: translateY(40px) scale(0.98);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    
    .card-shell:hover {
      box-shadow: 
        0 28px 80px -15px rgba(62, 143, 255, 0.22),
        0 14px 36px -12px rgba(10, 26, 63, 0.1),
        0 6px 16px rgba(0, 0, 0, 0.04),
        inset 0 1px 0 rgba(255, 255, 255, 0.95);
      transform: translateY(-3px);
      border-color: rgba(59, 130, 246, 0.2);
    }
    
    /* 🎨 Enhanced Glassmorphic Overlay */
    .card-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        radial-gradient(circle at top right, rgba(99, 102, 241, 0.04) 0%, transparent 50%),
        radial-gradient(circle at bottom left, rgba(59, 130, 246, 0.04) 0%, transparent 50%),
        radial-gradient(circle at center, rgba(139, 92, 246, 0.02) 0%, transparent 70%);
      backdrop-filter: blur(2px);
      border-radius: 36px;
      pointer-events: none;
      z-index: 0;
      animation: overlayFloat 8s ease-in-out infinite;
    }
    
    @keyframes overlayFloat {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 0.8; }
    }
    
    /* 📦 Card Inner Container */
    .card-inner {
      width: min(100%, 760px);
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 32px;
      position: relative;
      z-index: 2;
    }
    
    /* ✨ Premium Mode Toggle with Animated Slider */
    .mode-toggle { 
      display: flex; 
      justify-content: center;
      margin-bottom: 4px;
    }
    
    .toggle-container {
      position: relative;
      display: inline-flex;
      padding: 7px;
      border-radius: 18px;
      background: rgba(248, 250, 255, 0.9);
      border: 1px solid rgba(226, 232, 240, 0.5);
      box-shadow: 
        0 6px 16px -6px rgba(62, 143, 255, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.7),
        inset 0 -1px 0 rgba(0, 0, 0, 0.03);
      gap: 8px;
    }
    
    .toggle-slider {
      position: absolute;
      top: 7px;
      left: 7px;
      width: calc(50% - 11px);
      height: calc(100% - 14px);
      background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
      border-radius: 14px;
      box-shadow: 
        0 6px 16px -4px rgba(62, 143, 255, 0.5),
        0 3px 8px rgba(99, 102, 241, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.2),
        inset 0 -1px 0 rgba(0, 0, 0, 0.1);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 0;
    }
    
    .toggle-slider.post-active {
      left: calc(50% + 4px);
    }
    
    .toggle-btn {
      position: relative;
      z-index: 1;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      min-width: 150px;
      padding: 14px 28px;
      border-radius: 14px;
      border: none;
      background: transparent;
      color: #64748b;
      font-weight: 600;
      font-size: 15px;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      justify-content: center;
    }
    
    .toggle-btn:hover:not(.active) {
      color: #475569;
      background: rgba(59, 130, 246, 0.04);
    }
    
    .toggle-btn.active {
      color: #ffffff;
    }
    
    .toggle-btn:focus-visible {
      outline: 3px solid rgba(62, 143, 255, 0.4);
      outline-offset: 4px;
    }
    
    .toggle-icon {
      transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .toggle-btn:hover .toggle-icon {
      transform: scale(1.1) rotate(-5deg);
    }
    
    .toggle-btn.active .toggle-icon {
      transform: scale(1.15);
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
    }
    
    /* 📋 Form Body with Enhanced Transitions */
    .form-body { 
      display: flex; 
      flex-direction: column; 
      gap: 28px;
      animation: fadeIn 0.5s ease-out;
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    /* 🚀 Ultra-Premium CTA Button */
    .cta-row { 
      display: flex; 
      justify-content: center; 
      margin-top: 20px;
    }
    
    .form-main-btn {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      border-radius: 18px;
      background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
      color: #ffffff;
      border: none;
      box-shadow: 
        0 16px 36px -10px rgba(62, 143, 255, 0.5),
        0 6px 16px rgba(99, 102, 241, 0.25),
        inset 0 1px 0 rgba(255, 255, 255, 0.25),
        inset 0 -1px 0 rgba(0, 0, 0, 0.1);
      font-weight: 700;
      font-size: 17px;
      letter-spacing: 0.02em;
      padding: 18px 44px;
      min-width: 260px;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      overflow: hidden;
    }
    
    .form-main-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent);
      transition: left 0.6s ease;
    }
    
    .form-main-btn:hover::before {
      left: 100%;
    }
    
    .form-main-btn::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      transform: translate(-50%, -50%);
      transition: width 0.6s ease, height 0.6s ease;
    }
    
    .form-main-btn:active::after {
      width: 300px;
      height: 300px;
      opacity: 0;
    }
    
    .form-main-btn:hover { 
      transform: translateY(-3px) scale(1.02); 
      box-shadow: 
        0 20px 44px -10px rgba(62, 143, 255, 0.6),
        0 8px 20px rgba(99, 102, 241, 0.35),
        inset 0 1px 0 rgba(255, 255, 255, 0.3);
    }
    
    .form-main-btn:active { 
      transform: translateY(-1px) scale(0.99); 
    }
    
    .form-main-btn[disabled] { 
      opacity: 0.65; 
      cursor: not-allowed; 
      transform: none; 
      box-shadow: 
        0 10px 24px -10px rgba(62, 143, 255, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.15);
    }
    
    .form-main-btn[disabled]:hover {
      transform: none;
    }
    
    .btn-content {
      display: flex;
      align-items: center;
      gap: 12px;
      position: relative;
      z-index: 1;
    }
    
    .btn-icon {
      transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
    }
    
    .form-main-btn:hover .btn-icon {
      transform: translateX(6px) scale(1.1);
      animation: iconBounce 0.6s ease-in-out;
    }
    
    @keyframes iconBounce {
      0%, 100% { transform: translateX(6px) scale(1.1); }
      50% { transform: translateX(10px) scale(1.15); }
    }
    
    .spinner {
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
    
    /* ⚠️ Error Message */
    .error-text { 
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      text-align: center; 
      font-size: 14px; 
      font-weight: 500;
      color: #ef4444;
      background: rgba(239, 68, 68, 0.05);
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: 12px;
      padding: 12px 20px;
      animation: shakeError 0.4s ease-out;
    }
    
    @keyframes shakeError {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-8px); }
      75% { transform: translateX(8px); }
    }
    
    /* 📤 Premium Upload Progress Section */
    .upload-progress-section {
      margin: 20px 0;
      padding: 20px;
      background: linear-gradient(135deg, rgba(249, 250, 251, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%);
      border-radius: 16px;
      border: 1px solid rgba(226, 232, 240, 0.7);
      box-shadow: 0 4px 12px -4px rgba(62, 143, 255, 0.08);
    }
    
    .upload-progress-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 16px 0;
      font-size: 15px;
      font-weight: 700;
      color: #1e293b;
    }
    
    .upload-progress-title svg {
      color: #3b82f6;
    }
    
    .upload-progress-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .upload-progress-item {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 12px;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 12px;
      border: 1px solid rgba(226, 232, 240, 0.5);
    }
    
    .upload-file-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }
    
    .upload-filename {
      font-size: 13px;
      color: #475569;
      font-weight: 600;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .upload-status {
      font-size: 11px;
      padding: 4px 10px;
      border-radius: 8px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      flex-shrink: 0;
    }
    
    .status-pending {
      background: rgba(156, 163, 175, 0.15);
      color: #6b7280;
      border: 1px solid rgba(156, 163, 175, 0.2);
    }
    
    .status-uploading {
      background: rgba(59, 130, 246, 0.15);
      color: #2563eb;
      border: 1px solid rgba(59, 130, 246, 0.2);
    }
    
    .status-success {
      background: rgba(34, 197, 94, 0.15);
      color: #16a34a;
      border: 1px solid rgba(34, 197, 94, 0.2);
    }
    
    .status-failed {
      background: rgba(239, 68, 68, 0.15);
      color: #dc2626;
      border: 1px solid rgba(239, 68, 68, 0.2);
    }
    
    .upload-progress-bar {
      height: 6px;
      background: rgba(226, 232, 240, 0.5);
      border-radius: 999px;
      overflow: hidden;
      box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #3b82f6 0%, #6366f1 100%);
      border-radius: 999px;
      transition: width 0.3s ease;
      box-shadow: 0 0 8px rgba(59, 130, 246, 0.4);
    }
    
    /* 📱 Mobile Responsive Design */
    @media (max-width: 900px) {
      .card-shell { 
        padding: 28px; 
        border-radius: 28px; 
      }
      
      .card-inner { 
        gap: 24px; 
      }
      
      .toggle-btn { 
        min-width: 120px; 
        font-size: 14px; 
      }
      
      .form-main-btn {
        padding: 15px 36px;
        min-width: 220px;
        font-size: 15px;
      }
    }
    
    @media (max-width: 640px) {
      .card-shell { 
        padding: 24px 20px; 
        border-radius: 24px;
        box-shadow: 
          0 16px 50px -12px rgba(62, 143, 255, 0.12),
          0 6px 20px -6px rgba(10, 26, 63, 0.06);
      }
      
      .card-inner { 
        gap: 22px; 
      }
      
      .form-body { 
        gap: 20px; 
      }
      
      .toggle-container {
        width: 100%;
        max-width: 100%;
      }
      
      .toggle-btn {
        flex: 1;
        min-width: 0;
        padding: 12px 16px;
        font-size: 14px;
      }
      
      .toggle-icon {
        width: 16px;
        height: 16px;
      }
      
      .form-main-btn { 
        width: 100%; 
        min-width: 0;
        padding: 16px 32px;
      }
      
      .btn-icon {
        width: 16px;
        height: 16px;
      }
      
      .upload-progress-section {
        padding: 16px;
        margin: 16px 0;
      }
      
      .upload-progress-item {
        padding: 10px;
      }
    }
    
    @media (max-width: 480px) {
      .card-shell {
        padding: 20px 16px;
        border-radius: 20px;
      }
      
      .toggle-btn {
        padding: 10px 12px;
        font-size: 13px;
        gap: 6px;
      }
      
      .toggle-btn span {
        display: none;
      }
      
      .toggle-icon {
        display: block;
        margin: 0 auto;
      }
      
      .toggle-slider {
        width: calc(50% - 9px);
      }
    }
    
    /* ✨ Reduced Motion Support */
    @media (prefers-reduced-motion: reduce) {
      .card-shell,
      .form-main-btn,
      .toggle-btn,
      .toggle-slider,
      .progress-fill,
      .btn-icon,
      .spinner {
        transition: none;
        animation: none;
      }
      
      .form-main-btn::before {
        display: none;
      }
    }
  `]
})
export class ExploreFormCardComponent implements OnInit, OnChanges {
  @Input() tab: 'rooms' | 'rides' | 'market' = 'rooms';
  @Output() action = new EventEmitter<{ tab: 'rooms' | 'rides' | 'market'; mode: 'search' | 'post'; payload: any }>();
  mode = signal<'search' | 'post'>('search');
  loading = signal(false);
  error = signal('');
  uploadProgress = signal<{ filename: string; status: 'pending' | 'uploading' | 'success' | 'failed'; progress?: number }[]>([]);
  private lastMode: Record<string, 'search' | 'post'> = { rooms: 'search', rides: 'search', market: 'search' };

  ngOnInit() {
    console.log('ExploreFormCard initialized with tab:', this.tab);
  }

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
  ngOnChanges(changes: SimpleChanges) {
    if (changes['tab']) {
      console.log('Tab changed to:', this.tab);
    }
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
    if (this.tab === 'rooms' && this.mode() === 'post') {
      this.postRoom();
      return;
    }
    // Non-room flows emit event directly
    this.loading.set(true);
    const payload = form.getRawValue();
    this.action.emit({ tab: this.tab, mode: this.mode(), payload });
    this.loading.set(false);
  }

  // --- Room posting logic (S3 upload + create listing) ---
  private uploads = inject(UploadsService);
  private roomsService = inject(RoomsService);
  private currentUser = inject(CurrentUserService);
  private toast = inject(ToastService);
  private roomStore = inject(RoomStore);

  private updateUploadProgress(index: number, updates: Partial<{ status: 'pending' | 'uploading' | 'success' | 'failed'; progress?: number }>) {
    const current = this.uploadProgress();
    if (index >= 0 && index < current.length) {
      const updated = [...current];
      updated[index] = { ...updated[index], ...updates };
      this.uploadProgress.set(updated);
    }
  }

  private async postRoom(): Promise<void> {
    const raw = this.roomsPostForm.getRawValue();
    const files: File[] = Array.isArray(raw.photos) ? raw.photos.filter((f: any) => f instanceof File) : [];
    if (files.length < 3) {
      this.error.set('Please add at least 3 photos.');
      this.roomsPostForm.get('photos')?.markAsTouched();
      return;
    }
    const user = this.currentUser.currentUser();
    if (!user) {
      this.error.set('Sign in required to post a room.');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    
    // Initialize progress tracking
    const progressItems = files.map((f: File) => ({
      filename: f.name,
      status: 'pending' as const,
      progress: 0
    }));
    this.uploadProgress.set(progressItems);
    
    try {
      // Convert HEIC/HEIF to JPEG for better compatibility
      const { ensureDisplayableImage } = await import('../../core/utils/heic');
      const preparedFiles: File[] = [];
      const fileMetas: { ext?: string; contentType?: string }[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        // Update progress: processing
        this.updateUploadProgress(i, { status: 'uploading', progress: 10 });
        
        let out = f;
        try { out = await ensureDisplayableImage(f); } catch {}
        preparedFiles.push(out);
        const type = out.type || '';
        const extFromType = type.split('/')[1]?.split(';')[0];
        const extFromName = (out.name?.split('.').pop() || '').toLowerCase();
        const ext = (extFromType || extFromName || 'jpg').replace(/^jpg$/,'jpeg');
        fileMetas.push({ ext, contentType: type || (ext ? `image/${ext}` : undefined) });
        
        // Update progress: processed
        this.updateUploadProgress(i, { status: 'uploading', progress: 20 });
      }

      // Step 1: init on backend to get S3 presigns
      const initPayload: any = {
        city: raw.city, state: raw.state, address: raw.address,
        roomType: raw.roomType, price: Number(raw.price) || 0,
        amenities: raw.amenities, description: raw.description,
        files: fileMetas
      };
      const initResp = await this.roomsService.initUpload(initPayload).toPromise();
      if (!initResp || !initResp.uploads?.length) {
        this.error.set('Failed to prepare uploads.');
        this.loading.set(false); return;
      }
      const { roomId, uploads } = initResp as any;
      if (uploads.length !== preparedFiles.length) {
        this.error.set('Upload preparation mismatch.');
        this.loading.set(false); return;
      }

      // Step 2: upload each file with provided presign
      const uploadResults = await Promise.allSettled(uploads.map(async (p: any, idx: number) => {
        try {
          // Update progress: starting upload
          this.updateUploadProgress(idx, { status: 'uploading', progress: 30 });
          const result = await this.uploads.uploadToS3(p, preparedFiles[idx]);
          // Update progress: upload complete
          this.updateUploadProgress(idx, { status: 'success', progress: 100 });
          return result;
        } catch (error) {
          // Update progress: upload failed
          this.updateUploadProgress(idx, { status: 'failed', progress: 0 });
          throw error;
        }
      }));
      const succeeded = uploads.filter((p: any, i: number) => uploadResults[i]?.status === 'fulfilled');
      const uploadedUrls: string[] = succeeded.map((p: any) => p.publicUrl).filter(Boolean);
      const failedCount = uploadResults.filter((r: any) => r.status === 'rejected').length;
      if (failedCount > 0) this.toast.warning(`${failedCount} photo${failedCount === 1 ? '' : 's'} failed to upload.`);
      if (uploadedUrls.length < 3) { this.error.set('Minimum 3 successful photo uploads required.'); this.loading.set(false); return; }

      const listingPayload: any = {
        title: `${raw.roomType || 'Room'} in ${raw.city}`.trim(),
        description: raw.description || 'No description yet',
        address: raw.address || undefined,
        lat: typeof raw.addressLat === 'number' ? raw.addressLat : undefined,
        lon: typeof raw.addressLon === 'number' ? raw.addressLon : undefined,
        city: raw.city || '',
        state: raw.state || '',
        price: Number(raw.price) || 0,
        roomType: (raw.roomType === 'private' ? 'private' : 'shared'),
        bath: 'shared',
        furnished: Array.isArray(raw.amenities) ? raw.amenities.includes('furnished') : false,
        rules: { 
          vegetarian: false, 
          smoking: false, 
          petsOk: false 
        },
        distanceKm: undefined,
        photos: uploadedUrls,
        image: uploadedUrls[0],
        amenities: Array.isArray(raw.amenities) ? raw.amenities.filter((a: string) => a !== 'furnished') : [],
        universityId: undefined
      };
      // Step 3: publish created listing using uploaded photo URLs
      const created = await this.roomsService.publish(roomId, listingPayload).toPromise();
      if (!created) {
        this.error.set('Failed to create listing.');
        this.loading.set(false);
        return;
      }
      // Add to RoomStore for immediate visibility
      const features: string[] = [];
      if (created.roomType === 'private') features.push('Private room');
      if (created.furnished) features.push('Furnished');
      if (!created.rules?.smoking) features.push('No smoking');
      if (created.rules?.petsOk) features.push('Pets ok');
      const card = {
        id: created.id,
        title: created.title,
        price: created.price,
        image: created.image || created.photos?.[0] || '/assets/placeholder-room.jpg',
        address: [created.city, created.state].filter(Boolean).join(', '),
        distance: created.distanceKm ? `${created.distanceKm} km` : '',
        features,
        isAvailable: true,
        availabilityStart: created.availabilityStart,
        availabilityEnd: created.availabilityEnd,
        city: created.city,
        hostName: user.displayName || 'Host'
      } as any; // RoomCard structure
      this.roomStore.addRoom(card);
      this.toast.success('Room posted successfully');
      // Reset form minimal fields (retain city for convenience)
      this.roomsPostForm.patchValue({ description: '', price: null, photos: [] });
      this.roomsPostForm.get('photos')?.setValue([]);
      this.roomsPostForm.markAsPristine();
      this.action.emit({ tab: 'rooms', mode: 'post', payload: listingPayload });
      // Clear upload progress after success
      setTimeout(() => this.uploadProgress.set([]), 2000);
    } catch (e: any) {
      console.error(e);
      this.error.set('Unexpected error posting room.');
    } finally {
      this.loading.set(false);
      // Clear upload progress on error after a delay
      if (this.uploadProgress().length > 0) {
        setTimeout(() => this.uploadProgress.set([]), 3000);
      }
    }
  }
}
