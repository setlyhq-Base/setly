import { Component, OnInit, HostListener, signal, computed, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScrollingModule, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { AssistantService } from './assistant.service';
import { RoomPreviewCardComponent } from './room-preview-card.component';
import { RideCtaComponent } from './ride-cta.component';
import { PLAYBOOKS } from './assistant-playbooks';
import { Router } from '@angular/router';

@Component({
  selector: 'app-assistant-widget',
  standalone: true,
  imports: [CommonModule, FormsModule, ScrollingModule, RoomPreviewCardComponent, RideCtaComponent],
  templateUrl: './assistant-widget.component.html',
  styleUrl: './assistant-widget.component.css',
  host: { 'style': 'pointer-events:auto' }
})
export class AssistantWidgetComponent implements OnInit, AfterViewInit, OnDestroy {
  isOpen = false;
  hasNewTips = false;
  subtitleIndex = 0;
  subtitles = ['Housing', 'Rides', 'Settling in'];
  showThreads = signal(false);

  input = signal('');
  // Signals assigned after DI in constructor
  items!: typeof this.svc.messages;
  playbooks!: typeof this.svc.playbooks;
  threads = computed(() => this.svc.threads());
  currentThreadId = computed(() => (this as any).svc['_currentThreadId']?.());
  @ViewChild(CdkVirtualScrollViewport) viewport?: CdkVirtualScrollViewport;

  // Responsive layout signals
  isMobile = signal(false);
  panelHeight = signal('min(70vh, 720px)');
  listHeight = signal('calc(100% - var(--hdr) - var(--cmp))');

  showJumpChip = signal(false);
  private userScrolledUp = false;
  private ro?: ResizeObserver;

  // Draggable positions (desktop): launcher and panel
  launcherX = signal<number>(24); // px from left
  launcherY = signal<number>(Math.round(window.innerHeight / 2)); // px from top
  panelX = signal<number>(24);
  panelY = signal<number>(Math.round(window.innerHeight / 2));
  @ViewChild('launcherRef') launcherRef?: ElementRef<HTMLButtonElement>;
  @ViewChild('panelRef') panelRef?: ElementRef<HTMLDivElement>;
  private dragging: { type: 'launcher'|'panel'; dx: number; dy: number } | null = null;
  private suppressNextOutsideClose = false;

  constructor(public svc: AssistantService, private router: Router, private el: ElementRef<HTMLElement>) {
    this.items = this.svc.messages;
    this.playbooks = this.svc.playbooks;
  }

  ngOnInit() {
    // Idle auto-open on / or /auth/sign-in once per session
    const path = this.router.url;
    const should = path === '/' || path.startsWith('/auth/sign-in');
    if (should && !sessionStorage.getItem('assistantAutoOpened')) {
      setTimeout(() => { this.open(); sessionStorage.setItem('assistantAutoOpened','1'); }, 10000);
    }
    // rotate subtitle
    setInterval(() => { this.subtitleIndex = (this.subtitleIndex + 1) % this.subtitles.length; }, 2200);

    // Responsive flags + observers
    this.updateMobileFlag();
    window.addEventListener('resize', this.updateMobileFlag);
    this.ro = new ResizeObserver(() => this.computeHeights());
    try { this.ro.observe(this.el.nativeElement); } catch {}
    this.computeHeights();

    // Load persisted positions (desktop only)
    try {
      const s1 = localStorage.getItem('assistantLauncherPos');
      if (s1) { const pos = JSON.parse(s1) as { x:number; y:number }; if (Number.isFinite(pos.x) && Number.isFinite(pos.y)) { this.launcherX.set(pos.x); this.launcherY.set(pos.y); } }
    } catch {}
    try {
      const s2 = localStorage.getItem('assistantPanelPos');
      if (s2) { const pos = JSON.parse(s2) as { x:number; y:number }; if (Number.isFinite(pos.x) && Number.isFinite(pos.y)) { this.panelX.set(pos.x); this.panelY.set(pos.y); } }
    } catch {}
  }
  ngAfterViewInit(){
    setTimeout(()=> this.scrollToBottom(), 0);
    // track user scroll position for jump chip
    const scroller = this.viewport?.elementRef?.nativeElement as HTMLElement | undefined;
    scroller?.addEventListener('scroll', () => {
      const el = scroller;
      const atBottomGap = el.scrollHeight - el.scrollTop - el.clientHeight;
      this.userScrolledUp = atBottomGap > 80;
      this.showJumpChip.set(this.userScrolledUp);
    });
  }

  ngOnDestroy(){
    window.removeEventListener('resize', this.updateMobileFlag);
    try { this.ro?.disconnect(); } catch {}
    // restore scroll lock if any
    document.body.style.overflow = '';
    this.endDrag();
  }

  open(){
    this.isOpen = true; this.svc.onOpen();
    // prevent background scroll on mobile
    if (this.isMobile()) document.body.style.overflow = 'hidden';
    // autofocus after open
    setTimeout(()=>{
      const inputEl = (this.el.nativeElement.querySelector('[data-testid="assistant-input"]') as HTMLElement | null);
      inputEl?.focus?.();
      // Anchor panel next to launcher on first open or if user hasn't moved it
      if (!this.isMobile()) {
        try {
          const moved = localStorage.getItem('assistantPanelMoved') === '1';
          if (!moved) this.anchorPanelNearLauncher();
        } catch { this.anchorPanelNearLauncher(); }
      }
    }, 0);
  }
  close(){ this.isOpen = false; this.svc.onClose(); document.body.style.overflow = ''; }
  minimize(){ this.isOpen = false; document.body.style.overflow = ''; }

  send(){ const val = this.input(); if (!val.trim()) return; this.svc.sendUserMessage(val.trim()); this.input.set(''); }

  onChip(key: string){ this.svc.handleChip(key); }
  onStartPlaybook(key: string){ this.svc.triggerPlaybook(key); }

  toggleThreads(){ this.showThreads.set(!this.showThreads()); }
  onNewThread(){ this.svc.newThread(); this.showThreads.set(false); setTimeout(()=> this.scrollToBottom(), 0); }
  onSwitchThread(id: string){ this.svc.switchThread(id); this.showThreads.set(false); setTimeout(()=> this.scrollToBottom(), 0); }

  @HostListener('document:keydown.escape') onEsc(){ if (this.isOpen) this.close(); }
  @HostListener('document:click', ['$event']) onDocClick(ev: MouseEvent){
    if (!this.isOpen) return;
    if (this.suppressNextOutsideClose) { this.suppressNextOutsideClose = false; return; }
    const target = ev.target as Node | null;
    const panel = this.panelRef?.nativeElement as Node | undefined;
    const launcher = this.launcherRef?.nativeElement as Node | undefined;
    if (panel && target && panel.contains(target)) return; // inside panel
    if (launcher && target && launcher.contains(target)) return; // on launcher
    // Otherwise, outside click -> close
    this.close();
  }

  private scrollToBottom(){ try{ this.viewport?.scrollToIndex(1e9); }catch{} }
  private scrollToBottomIfNeeded(){ if (!this.userScrolledUp) this.scrollToBottom(); }

  // Responsive helpers
  updateMobileFlag = () => { this.isMobile.set(window.innerWidth <= 640); this.computeHeights(); };
  private computeHeights(){
    const hdr = window.innerWidth <= 640 ? 60 : 56;
    const cmp = window.innerWidth <= 640 ? 68 : 64;
    document.documentElement.style.setProperty('--hdr', `${hdr}px`);
    document.documentElement.style.setProperty('--cmp', `${cmp}px`);
    if (this.isMobile()) this.panelHeight.set('100dvh'); else this.panelHeight.set('min(70vh, 720px)');
    this.listHeight.set(`calc(100% - ${hdr + cmp}px)`);
  }

  // Drag logic (desktop only)
  onLauncherPointerDown(ev: PointerEvent){
    if (this.isMobile()) return;
    try { (ev.target as Element).setPointerCapture?.(ev.pointerId); } catch {}
    const rect = this.launcherRef?.nativeElement.getBoundingClientRect();
    const dx = ev.clientX - (rect?.left ?? 0);
    const dy = ev.clientY - (rect?.top ?? 0);
    this.dragging = { type: 'launcher', dx, dy };
    document.addEventListener('pointermove', this.onPointerMove, { passive: false });
    document.addEventListener('pointerup', this.onPointerUp, { passive: false });
    document.body.classList.add('assistant-dragging');
    ev.preventDefault();
  }
  onPanelHeaderPointerDown(ev: PointerEvent){
    if (this.isMobile()) return;
    // Ignore drags starting on buttons
    const t = ev.target as HTMLElement;
    if (t && t.closest('button')) return;
    try { (ev.target as Element).setPointerCapture?.(ev.pointerId); } catch {}
    const rect = this.panelRef?.nativeElement.getBoundingClientRect();
    const dx = ev.clientX - (rect?.left ?? 0);
    const dy = ev.clientY - (rect?.top ?? 0);
    this.dragging = { type: 'panel', dx, dy };
    document.addEventListener('pointermove', this.onPointerMove, { passive: false });
    document.addEventListener('pointerup', this.onPointerUp, { passive: false });
    document.body.classList.add('assistant-dragging');
    ev.preventDefault();
  }
  private onPointerMove = (ev: PointerEvent) => {
    if (!this.dragging) return;
    const maxX = window.innerWidth;
    const maxY = window.innerHeight;
    let x = ev.clientX - this.dragging.dx;
    let y = ev.clientY - this.dragging.dy;
    // Size-aware clamping
    if (this.dragging.type === 'launcher') {
      const el = this.launcherRef?.nativeElement;
      const w = el?.offsetWidth ?? 56; const h = el?.offsetHeight ?? 56;
      x = Math.max(0, Math.min(x, maxX - w));
      y = Math.max(0, Math.min(y, maxY - h));
      this.launcherX.set(x); this.launcherY.set(y);
    } else {
      const el = this.panelRef?.nativeElement;
      const w = el?.offsetWidth ?? 420; const h = el?.offsetHeight ?? 520;
      x = Math.max(0, Math.min(x, maxX - w));
      y = Math.max(0, Math.min(y, maxY - h));
      this.panelX.set(x); this.panelY.set(y);
    }
    ev.preventDefault();
  };
  private onPointerUp = (_ev: PointerEvent) => {
    if (!this.dragging) return;
    if (this.dragging.type === 'launcher') {
      try { localStorage.setItem('assistantLauncherPos', JSON.stringify({ x: this.launcherX(), y: this.launcherY() })); } catch {}
    } else {
      try {
        localStorage.setItem('assistantPanelPos', JSON.stringify({ x: this.panelX(), y: this.panelY() }));
        localStorage.setItem('assistantPanelMoved', '1');
      } catch {}
    }
    this.endDrag();
  };
  private endDrag(){
    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerup', this.onPointerUp);
    document.body.classList.remove('assistant-dragging');
    this.dragging = null;
    // Prevent immediate outside-click close on drag end
    this.suppressNextOutsideClose = true;
    setTimeout(() => { this.suppressNextOutsideClose = false; }, 0);
  }

  private anchorPanelNearLauncher(){
    try {
      const l = this.launcherRef?.nativeElement.getBoundingClientRect();
      const panelEl = this.panelRef?.nativeElement as HTMLElement | undefined;
      if (!l || !panelEl) return;
      const gap = 12;
      const pW = panelEl.offsetWidth || 420;
      const pH = panelEl.offsetHeight || Math.min(720, Math.round(window.innerHeight * 0.7));
      let x = l.right + gap; // default to the right of launcher
      if (x + pW > window.innerWidth - gap) {
        x = l.left - pW - gap; // place to left if no space on right
      }
      x = Math.max(gap, Math.min(x, window.innerWidth - pW - gap));
      // Vertically center relative to launcher
      let y = Math.round(l.top + (l.height / 2) - (pH / 2));
      y = Math.max(gap, Math.min(y, window.innerHeight - pH - gap));
      this.panelX.set(x);
      this.panelY.set(y);
    } catch {}
  }
}
