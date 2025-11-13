import { Component, OnInit, HostListener, signal, computed, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScrollingModule, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ActionChipsComponent } from './action-chips.component';
import { AssistantService } from './assistant.service';
import { RoomPreviewCardComponent } from './room-preview-card.component';
import { RideCtaComponent } from './ride-cta.component';
import { TypingIndicatorComponent } from './typing-indicator.component';
import { PLAYBOOKS } from './assistant-playbooks';
import { Router } from '@angular/router';

@Component({
  selector: 'app-assistant-widget',
  standalone: true,
  imports: [CommonModule, FormsModule, ScrollingModule, ActionChipsComponent, RoomPreviewCardComponent, RideCtaComponent, TypingIndicatorComponent],
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
  }

  open(){
    this.isOpen = true; this.svc.onOpen();
    // prevent background scroll on mobile
    if (this.isMobile()) document.body.style.overflow = 'hidden';
    // autofocus after open
    setTimeout(()=>{
      const inputEl = (this.el.nativeElement.querySelector('[data-testid="assistant-input"]') as HTMLElement | null);
      inputEl?.focus?.();
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
}
