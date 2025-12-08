import { Component, signal, Output, EventEmitter, HostListener, inject, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExploreFormCardComponent } from '../explore/explore-form-card.component';

@Component({
  selector: 'app-unified-search',
  standalone: true,
  imports: [CommonModule, ExploreFormCardComponent],
  template: `
    <section class="search-wrap">
      <!-- � Floating Accent Orbs -->
      <div class="accent-orbs" aria-hidden="true">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
      </div>

      <!-- 🎨 Premium Category Selector with Enhanced Glassmorphism - NOW STICKY! -->
      <div class="category-selector-container sticky-tabs">
        <div class="category-glow"></div>
        <nav class="category-tabs" role="tablist" aria-label="Search categories">
          <button
            role="tab" 
            [attr.aria-selected]="active() === 'rooms'" 
            class="category-tab" 
            [class.active]="active() === 'rooms'" 
            (click)="setTab('rooms')"
            type="button">
            <div class="tab-ripple"></div>
            <div class="tab-content">
              <div class="tab-icon-wrapper">
                <svg class="tab-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M3 10l9-7 9 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M10 21v-6h4v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <span class="tab-label">Rooms</span>
              <span class="tab-subtitle">Find housing</span>
            </div>
            <div class="tab-indicator"></div>
          </button>
          
          <button 
            role="tab" 
            [attr.aria-selected]="active() === 'rides'" 
            class="category-tab" 
            [class.active]="active() === 'rides'" 
            (click)="setTab('rides')"
            type="button">
            <div class="tab-ripple"></div>
            <div class="tab-content">
              <div class="tab-icon-wrapper">
                <svg class="tab-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 17h14M5 17c-1.1 0-2-.9-2-2v-4c0-.55.45-1 1-1l2.5-4c.3-.48.84-.8 1.44-.8h7.12c.6 0 1.14.32 1.44.8L19 10c.55 0 1 .45 1 1v4c0 1.1-.9 2-2 2M5 17v1M19 17v1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="7.5" cy="17" r="1.5" fill="currentColor"/>
                  <circle cx="16.5" cy="17" r="1.5" fill="currentColor"/>
                </svg>
              </div>
              <span class="tab-label">Rides</span>
              <span class="tab-subtitle">Share trips</span>
            </div>
            <div class="tab-indicator"></div>
          </button>
          
          <button 
            role="tab" 
            [attr.aria-selected]="active() === 'market'" 
            class="category-tab" 
            [class.active]="active() === 'market'" 
            (click)="setTab('market')"
            type="button">
            <div class="tab-ripple"></div>
            <div class="tab-content">
              <div class="tab-icon-wrapper">
                <svg class="tab-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                  <path d="M12 13V3" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                  <path d="M3 8l9 5 9-5" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                </svg>
              </div>
              <span class="tab-label">Marketplace</span>
              <span class="tab-subtitle">Buy & sell</span>
            </div>
            <div class="tab-indicator"></div>
          </button>
        </nav>
      </div>

      <!-- 🎯 Form Card with Transition and Swipe Support -->
      <div 
        class="form-card-wrapper"
        (touchstart)="onTouchStart($event)"
        (touchmove)="onTouchMove($event)"
        (touchend)="onTouchEnd($event)"
        (mousedown)="onMouseDown($event)"
        (mousemove)="onMouseMove($event)"
        (mouseup)="onMouseUp($event)"
        (mouseleave)="onMouseLeave($event)">
        <app-explore-form-card
          [tab]="active()"
          (action)="handleAction($event)"></app-explore-form-card>
      </div>
    </section>
  `,
  styles: [
    `
    /* 🎨 Premium Search Wrapper */
    .search-wrap { 
      width: 100%; 
      max-width: 1040px; 
      margin: 0 auto; 
      padding: 0 24px;
      position: relative;
    }
    
    /* 🌟 Floating Accent Orbs for Depth */
    .accent-orbs {
      position: absolute;
      top: -100px;
      left: 0;
      right: 0;
      height: 300px;
      pointer-events: none;
      overflow: hidden;
      z-index: 0;
    }
    
    .orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(60px);
      opacity: 0.15;
      animation: floatOrb 20s ease-in-out infinite;
    }
    
    .orb-1 {
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, #3b82f6 0%, transparent 70%);
      top: 0;
      left: 10%;
      animation-delay: 0s;
    }
    
    .orb-2 {
      width: 250px;
      height: 250px;
      background: radial-gradient(circle, #6366f1 0%, transparent 70%);
      top: 50px;
      right: 15%;
      animation-delay: 5s;
    }
    
    .orb-3 {
      width: 200px;
      height: 200px;
      background: radial-gradient(circle, #8b5cf6 0%, transparent 70%);
      top: 100px;
      left: 50%;
      animation-delay: 10s;
    }
    
    @keyframes floatOrb {
      0%, 100% { 
        transform: translate(0, 0) scale(1); 
      }
      25% { 
        transform: translate(20px, -20px) scale(1.1); 
      }
      50% { 
        transform: translate(-15px, -10px) scale(0.9); 
      }
      75% { 
        transform: translate(10px, -25px) scale(1.05); 
      }
    }
    
    /* 🌟 Category Selector Container with Premium Glow + STICKY POSITIONING */
    .category-selector-container {
      margin-bottom: 36px;
      display: flex;
      justify-content: center;
      animation: fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      z-index: 1;
    }
    
    /* 📌 STICKY TABS - Instagram/Airbnb Style */
    .sticky-tabs {
      position: sticky;
      top: 0;
      z-index: 100;
      padding-top: 16px;
      padding-bottom: 16px;
      background: linear-gradient(to bottom, 
        rgba(250, 251, 255, 0.98) 0%, 
        rgba(250, 251, 255, 0.96) 80%, 
        rgba(250, 251, 255, 0) 100%);
      backdrop-filter: blur(12px) saturate(150%);
      -webkit-backdrop-filter: blur(12px) saturate(150%);
      margin-bottom: 24px;
      transition: box-shadow 0.3s ease, background-color 0.3s ease;
    }
    
    /* Add shadow when scrolled */
    .sticky-tabs.scrolled {
      box-shadow: 0 4px 20px -4px rgba(0, 0, 0, 0.1),
                  0 2px 8px -2px rgba(0, 0, 0, 0.06);
      background: linear-gradient(to bottom, 
        rgba(255, 255, 255, 0.98) 0%, 
        rgba(255, 255, 255, 0.95) 80%, 
        rgba(255, 255, 255, 0) 100%);
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    /* ✨ Glow Effect Behind Tabs */
    .category-glow {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 120%;
      height: 150%;
      background: radial-gradient(ellipse at center, rgba(59, 130, 246, 0.15) 0%, transparent 60%);
      filter: blur(40px);
      pointer-events: none;
      opacity: 0;
      animation: pulseGlow 4s ease-in-out infinite;
    }
    
    @keyframes pulseGlow {
      0%, 100% { 
        opacity: 0.3;
        transform: translate(-50%, -50%) scale(1);
      }
      50% { 
        opacity: 0.6;
        transform: translate(-50%, -50%) scale(1.1);
      }
    }
    
    /* 🎯 Premium Tab Navigation */
    .category-tabs {
      display: inline-flex;
      gap: 10px;
      padding: 6px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border-radius: 20px;
      border: 1px solid rgba(226, 232, 240, 0.5);
      box-shadow: 
        0 10px 32px -10px rgba(62, 143, 255, 0.12),
        0 4px 10px rgba(10, 26, 63, 0.05),
        inset 0 1px 0 rgba(255, 255, 255, 0.85),
        inset 0 -1px 0 rgba(0, 0, 0, 0.02);
      position: relative;
    }
    
    /* ✨ Individual Category Tab */
    .category-tab {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 16px 28px;
      border-radius: 16px;
      background: transparent;
      border: none;
      cursor: pointer;
      transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
      min-width: 130px;
    }
    
    /* 💫 Ripple Effect on Click */
    .tab-ripple {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(59, 130, 246, 0.3);
      transform: translate(-50%, -50%);
      pointer-events: none;
    }
    
    .category-tab:active .tab-ripple {
      animation: ripple 0.6s ease-out;
    }
    
    @keyframes ripple {
      to {
        width: 300px;
        height: 300px;
        opacity: 0;
      }
    }
    
    .category-tab:hover {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.06) 0%, rgba(99, 102, 241, 0.04) 100%);
      transform: translateY(-3px);
      box-shadow: 0 6px 18px -4px rgba(59, 130, 246, 0.15);
    }
    
    .category-tab.active {
      background: linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%);
      box-shadow: 
        0 10px 22px -6px rgba(62, 143, 255, 0.45),
        0 6px 14px -2px rgba(99, 102, 241, 0.25),
        0 0 0 1px rgba(255, 255, 255, 0.1) inset,
        0 1px 0 0 rgba(255, 255, 255, 0.2) inset,
        0 -1px 0 0 rgba(0, 0, 0, 0.1) inset;
      transform: translateY(-2px);
    }
    
    .category-tab:active {
      transform: scale(0.97);
    }
    
    .category-tab:focus-visible {
      outline: 3px solid rgba(62, 143, 255, 0.4);
      outline-offset: 4px;
    }
    
    /* 📦 Tab Content Wrapper */
    .tab-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      position: relative;
      z-index: 2;
    }
    
    /* 🎨 Icon Wrapper with Premium Styling */
    .tab-icon-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      border-radius: 13px;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(8px);
      transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    
    .category-tab:hover .tab-icon-wrapper {
      background: rgba(59, 130, 246, 0.12);
      transform: translateY(-3px) scale(1.04);
      box-shadow: 0 6px 14px -4px rgba(59, 130, 246, 0.25);
    }
    
    .category-tab.active .tab-icon-wrapper {
      background: rgba(255, 255, 255, 0.22);
      box-shadow: 
        0 6px 14px -4px rgba(0, 0, 0, 0.12),
        inset 0 1px 0 rgba(255, 255, 255, 0.25);
      border-color: rgba(255, 255, 255, 0.18);
    }
    
    /* 🔷 Tab Icon Styling */
    .tab-icon {
      color: #64748b;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      flex-shrink: 0;
    }
    
    .category-tab:hover .tab-icon {
      color: #3b82f6;
      transform: scale(1.1) rotate(5deg);
    }
    
    .category-tab.active .tab-icon {
      color: #ffffff;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
      animation: iconPop 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    @keyframes iconPop {
      0% { transform: scale(1); }
      50% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }
    
    /* 📝 Tab Label */
    .tab-label {
      font-size: 15px;
      font-weight: 700;
      color: #475569;
      letter-spacing: 0.01em;
      transition: all 0.3s ease;
      text-align: center;
    }
    
    .category-tab:hover .tab-label {
      color: #1e293b;
    }
    
    .category-tab.active .tab-label {
      color: #ffffff;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
    }
    
    /* 🏷️ Tab Subtitle */
    .tab-subtitle {
      font-size: 11px;
      font-weight: 500;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      transition: all 0.3s ease;
      opacity: 0.8;
    }
    
    .category-tab:hover .tab-subtitle {
      color: #64748b;
      opacity: 1;
    }
    
    .category-tab.active .tab-subtitle {
      color: rgba(255, 255, 255, 0.85);
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }
    
    /* 💫 Active Tab Indicator */
    .tab-indicator {
      position: absolute;
      bottom: 5px;
      left: 50%;
      transform: translateX(-50%) scaleX(0);
      width: 36px;
      height: 3px;
      border-radius: 999px;
      background: linear-gradient(90deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0.5) 100%);
      box-shadow: 0 0 10px rgba(255, 255, 255, 0.4), 0 0 20px rgba(255, 255, 255, 0.2);
      transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .category-tab.active .tab-indicator {
      transform: translateX(-50%) scaleX(1);
      animation: indicatorPulse 2.5s ease-in-out infinite;
    }
    
    @keyframes indicatorPulse {
      0%, 100% { 
        opacity: 0.75;
        box-shadow: 0 0 10px rgba(255, 255, 255, 0.4), 0 0 20px rgba(255, 255, 255, 0.2);
      }
      50% { 
        opacity: 1;
        box-shadow: 0 0 14px rgba(255, 255, 255, 0.6), 0 0 28px rgba(255, 255, 255, 0.3);
      }
    }
    
    /* 🎯 Form Card Wrapper with Transition + Swipe Animation */
    .form-card-wrapper {
      position: relative;
      z-index: 1;
      animation: cardFadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s backwards;
      user-select: none;
      -webkit-user-select: none;
      touch-action: pan-y pinch-zoom;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .form-card-wrapper.swiping {
      transition: none;
    }
    
    @keyframes cardFadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    /* 📱 Tablet Responsive (768px - 1024px) */
    @media (max-width: 1024px) {
      .search-wrap {
        padding: 0 20px;
      }
      
      .category-tabs {
        gap: 9px;
        padding: 6px;
      }
      
      .category-tab {
        padding: 15px 26px;
        min-width: 125px;
      }
      
      .tab-icon-wrapper {
        width: 42px;
        height: 42px;
        border-radius: 12px;
      }
    }
    
    /* 📱 Mobile Landscape & Small Tablets (640px - 768px) */
    @media (max-width: 768px) {
      .search-wrap {
        padding: 0 16px;
      }
      
      .accent-orbs {
        top: -80px;
        height: 250px;
      }
      
      .orb {
        filter: blur(50px);
      }
      
      .orb-1 {
        width: 250px;
        height: 250px;
      }
      
      .orb-2 {
        width: 200px;
        height: 200px;
      }
      
      .orb-3 {
        width: 150px;
        height: 150px;
      }
      
      .category-selector-container {
        margin-bottom: 28px;
      }
      
      .category-tabs {
        gap: 8px;
        padding: 6px;
        border-radius: 18px;
      }
      
      .category-tab {
        padding: 14px 24px;
        min-width: 115px;
        min-height: 44px; /* Ensure minimum tap target */
        border-radius: 15px;
      }
      
      .tab-icon-wrapper {
        width: 40px;
        height: 40px;
        border-radius: 11px;
      }
      
      .tab-label {
        font-size: 13.5px;
      }
      
      .tab-subtitle {
        font-size: 9.5px;
      }
    }
    
    /* 📱 Mobile Portrait (480px - 640px) */
    @media (max-width: 640px) {
      .category-selector-container {
        margin-bottom: 24px;
        overflow-x: auto;
        overflow-y: hidden;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none; /* IE/Edge */
      }
      
      .category-selector-container::-webkit-scrollbar {
        display: none; /* Chrome/Safari/Opera */
      }
      
      .category-tabs {
        width: max-content;
        min-width: 100%;
        justify-content: flex-start;
        gap: 8px;
        padding: 6px;
        border-radius: 18px;
      }
      
      .category-tab {
        flex: 0 0 auto;
        padding: 14px 24px;
        min-width: 120px;
        min-height: 44px; /* Ensure minimum tap target */
        border-radius: 14px;
      }
      
      .tab-icon-wrapper {
        width: 38px;
        height: 38px;
        border-radius: 11px;
      }
      
      .tab-icon {
        width: 18px;
        height: 18px;
      }
      
      .tab-label {
        font-size: 13px;
        font-weight: 600;
      }
      
      .tab-subtitle {
        font-size: 9.5px;
      }
      
      .tab-indicator {
        bottom: 4px;
        width: 32px;
        height: 3px;
      }
    }
    
    /* 📱 Small Mobile (< 480px) */
    @media (max-width: 480px) {
      .search-wrap {
        padding: 0 12px;
      }
      
      .accent-orbs {
        display: none; /* Hide orbs on very small screens for performance */
      }
      
      .category-selector-container {
        margin-bottom: 20px;
        overflow-x: auto;
        overflow-y: hidden;
        -webkit-overflow-scrolling: touch;
        padding: 0 4px;
      }
      
      .category-tabs {
        width: max-content;
        min-width: calc(100% - 8px);
        gap: 6px;
        padding: 5px;
        border-radius: 16px;
      }
      
      .category-tab {
        flex: 0 0 auto;
        padding: 12px 20px;
        border-radius: 13px;
        min-width: 110px;
        min-height: 44px; /* Ensure minimum tap target */
      }
      
      .tab-content {
        gap: 7px;
      }
      
      .tab-icon-wrapper {
        width: 34px;
        height: 34px;
        border-radius: 9px;
      }
      
      .tab-icon {
        width: 17px;
        height: 17px;
      }
      
      .tab-label {
        font-size: 12px;
        font-weight: 600;
      }
      
      .tab-subtitle {
        font-size: 9px;
      }
      
      .tab-indicator {
        bottom: 3px;
        width: 28px;
        height: 2.5px;
      }
      
      /* Add scroll hint shadow */
      .category-selector-container::after {
        content: '';
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        width: 40px;
        background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.9));
        pointer-events: none;
        z-index: 1;
      }
    }
    
    /* ✨ Reduced Motion Support */
    @media (prefers-reduced-motion: reduce) {
      .category-tab,
      .tab-icon,
      .tab-label,
      .tab-subtitle,
      .tab-indicator,
      .tab-icon-wrapper,
      .tab-ripple {
        transition: none;
        animation: none;
      }
      
      .category-selector-container,
      .form-card-wrapper,
      .accent-orbs {
        animation: none;
      }
      
      .orb {
        animation: none;
      }
      
      .category-glow {
        animation: none;
      }
    }
    `
    ]
})
export class UnifiedSearchComponent {
  private elementRef = inject(ElementRef);
  
  active = signal<'rooms' | 'rides' | 'market'>('rooms');
  @Output() activeTabChange = new EventEmitter<'rooms' | 'rides' | 'market'>();
  @Output() performedSearch = new EventEmitter<{ tab: 'rooms' | 'rides' | 'market'; mode: 'search' | 'post'; payload: any }>();

  // Swipe gesture state
  private touchStartX = 0;
  private touchStartY = 0;
  private currentX = 0;
  private isDragging = false;
  private lastScrollY = 0;
  
  private readonly SWIPE_THRESHOLD = 50; // Minimum distance for a swipe
  private readonly SWIPE_VELOCITY_THRESHOLD = 0.3; // Minimum velocity

  setTab(t: 'rooms' | 'rides' | 'market') {
    if (this.active() === t) {
      return;
    }
    this.active.set(t);
    this.activeTabChange.emit(t);
  }

  handleAction(event: { tab: 'rooms' | 'rides' | 'market'; mode: 'search' | 'post'; payload: any }) {
    this.performedSearch.emit(event);
  }

  // Swipe Navigation Implementation
  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.touches[0].clientX;
    this.touchStartY = event.touches[0].clientY;
    this.isDragging = true;
    const wrapper = event.currentTarget as HTMLElement;
    wrapper.classList.add('swiping');
  }

  onTouchMove(event: TouchEvent) {
    if (!this.isDragging) return;
    
    this.currentX = event.touches[0].clientX;
    const currentY = event.touches[0].clientY;
    const deltaX = this.currentX - this.touchStartX;
    const deltaY = currentY - this.touchStartY;
    
    // Only handle horizontal swipes (prevent vertical scroll interference)
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      event.preventDefault();
      const wrapper = event.currentTarget as HTMLElement;
      // Apply transform for visual feedback
      wrapper.style.transform = `translateX(${deltaX * 0.3}px)`;
    }
  }

  onTouchEnd(event: TouchEvent) {
    if (!this.isDragging) return;
    
    const wrapper = event.currentTarget as HTMLElement;
    wrapper.classList.remove('swiping');
    wrapper.style.transform = '';
    
    const deltaX = this.currentX - this.touchStartX;
    const deltaY = event.changedTouches[0].clientY - this.touchStartY;
    
    // Only process horizontal swipes
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > this.SWIPE_THRESHOLD) {
      if (deltaX > 0) {
        // Swipe right - go to previous tab
        this.navigateToPreviousTab();
      } else {
        // Swipe left - go to next tab
        this.navigateToNextTab();
      }
    }
    
    this.isDragging = false;
  }

  // Mouse events for desktop swipe support
  onMouseDown(event: MouseEvent) {
    this.touchStartX = event.clientX;
    this.isDragging = true;
    const wrapper = event.currentTarget as HTMLElement;
    wrapper.classList.add('swiping');
  }

  onMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;
    
    this.currentX = event.clientX;
    const deltaX = this.currentX - this.touchStartX;
    
    const wrapper = event.currentTarget as HTMLElement;
    wrapper.style.transform = `translateX(${deltaX * 0.3}px)`;
  }

  onMouseUp(event: MouseEvent) {
    if (!this.isDragging) return;
    
    const wrapper = event.currentTarget as HTMLElement;
    wrapper.classList.remove('swiping');
    wrapper.style.transform = '';
    
    const deltaX = this.currentX - this.touchStartX;
    
    if (Math.abs(deltaX) > this.SWIPE_THRESHOLD) {
      if (deltaX > 0) {
        this.navigateToPreviousTab();
      } else {
        this.navigateToNextTab();
      }
    }
    
    this.isDragging = false;
  }

  onMouseLeave(event: MouseEvent) {
    if (this.isDragging) {
      const wrapper = event.currentTarget as HTMLElement;
      wrapper.classList.remove('swiping');
      wrapper.style.transform = '';
      this.isDragging = false;
    }
  }

  private navigateToNextTab() {
    const tabs: Array<'rooms' | 'rides' | 'market'> = ['rooms', 'rides', 'market'];
    const currentIndex = tabs.indexOf(this.active());
    const nextIndex = (currentIndex + 1) % tabs.length;
    this.setTab(tabs[nextIndex]);
  }

  private navigateToPreviousTab() {
    const tabs: Array<'rooms' | 'rides' | 'market'> = ['rooms', 'rides', 'market'];
    const currentIndex = tabs.indexOf(this.active());
    const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    this.setTab(tabs[prevIndex]);
  }

  // Scroll listener to add shadow to sticky tabs
  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const stickyContainer = this.elementRef.nativeElement.querySelector('.sticky-tabs');
    
    if (stickyContainer) {
      if (scrollY > 50) {
        stickyContainer.classList.add('scrolled');
      } else {
        stickyContainer.classList.remove('scrolled');
      }
    }
    
    this.lastScrollY = scrollY;
  }
}
