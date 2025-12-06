import { Component, ElementRef, OnInit, ViewChild, computed, inject, signal, Signal } from '@angular/core';
import { effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MessageGatewayService } from './message-gateway.service';
import { ConversationStoreService, Conversation, Message } from './conversation-store.service';

@Component({
  selector: 'app-messages-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <style>
  .typing-dots { display: inline-block; }
  .typing-dots span { display:inline-block; width:3px; height:3px; margin:0 1px; border-radius:50%; background: var(--brand-azure); opacity:0.6; animation: tdots 1.1s infinite; }
    .typing-dots span:nth-child(2){ animation-delay: .2s; }
    .typing-dots span:nth-child(3){ animation-delay: .4s; }
    @keyframes tdots { 0%, 80%, 100% { transform: translateY(0); opacity:.4 } 40% { transform: translateY(-2px); opacity:1 } }
    .messages-shell { min-height: 0; }
    .messages-shell > aside,
    .messages-shell > section { min-height: 0; }
    .mobile-pane-btn {
      flex: 1 1 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      padding: 0.65rem 0.75rem;
      border-radius: 999px;
      border: 1px solid rgba(148,163,184,0.45);
      background: #fff;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #475569;
      transition: all .2s;
    }
    .mobile-pane-btn--active {
      background: var(--brand-gradient);
      color: #fff;
      border-color: transparent;
      box-shadow: 0 12px 24px -18px rgba(62,143,255,0.28);
    }
    .mobile-pane-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 18px;
      height: 18px;
      padding: 0 6px;
      border-radius: 999px;
      background: #ef4444;
      color: #fff;
      font-size: 0.7rem;
      line-height: 1;
    }
  </style>
  <main class="min-h-screen bg-white" data-testid="messages-page">
    <div class="mx-auto flex h-[calc(100vh-var(--header-height,64px))] max-w-[1500px] flex-col px-4 py-4 sm:px-6">
      <div class="mb-3 flex items-center gap-2 md:hidden">
        <button type="button" class="mobile-pane-btn" (click)="setMobilePane('list')" [class.mobile-pane-btn--active]="mobilePane()==='list'">
          Chats
          <span *ngIf="totalUnread() > 0" class="mobile-pane-badge">{{ totalUnread() }}</span>
        </button>
        <button type="button" class="mobile-pane-btn" (click)="setMobilePane('chat')" [class.mobile-pane-btn--active]="mobilePane()==='chat'">
          Conversation
        </button>
      </div>
      <div class="messages-shell flex grow flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:grid lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside class="flex min-h-[280px] flex-col border-b border-gray-100 bg-white lg:min-h-0 lg:border-b-0 lg:border-r lg:border-gray-100 lg:flex" [class.hidden]="mobilePane()==='chat'">
          <div class="border-b border-gray-100 px-4 pb-3 pt-4 sm:px-5">
            <div class="mb-2 flex items-center justify-between gap-2">
              <h2 class="text-lg font-semibold text-gray-900 sm:text-xl">Chats</h2>
              <div class="flex items-center gap-2">
                <button type="button" class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition hover:border-[#BBD9FF] hover:bg-[#E8F4FF] hover:text-brand-azure" title="New message">
                  ✉️
                </button>
                <button type="button" class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition hover:border-[#BBD9FF] hover:bg-[#E8F4FF] hover:text-brand-azure" title="Options">
                  ⋯
                </button>
              </div>
            </div>
            <input type="search" [(ngModel)]="inboxQuery" (input)="noop()" class="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[rgba(245,199,93,0.45)]" placeholder="Search messages…" />
            <div class="mt-3 flex items-center gap-2 overflow-x-auto pb-1 text-sm">
        <button type="button" *ngFor="let f of filtersList" (click)="currentFilter.set(f)" class="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium uppercase tracking-[0.08em] text-gray-600 transition hover:border-[#BBD9FF] hover:bg-[#E8F4FF]"
          [ngStyle]="currentFilter()==f ? { color:'#0F5FFF', borderColor:'#BBD9FF', background:'#E8F4FF' } : null">
                {{ f }}
              </button>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto px-2 py-2">
            <button type="button" *ngFor="let c of filteredConversations()" (click)="select(c.id)"
        class="relative flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-gray-50"
        [ngStyle]="activeId===c.id ? { background: '#E8F4FF' } : null">
      <span class="absolute inset-y-0 left-0 w-1 rounded-l-2xl" [ngStyle]="activeId===c.id ? { background: '#0F5FFF' } : null"></span>
              <span class="relative inline-block">
                <img *ngIf="c.avatarUrl; else init" [src]="c.avatarUrl" alt="avatar" class="h-10 w-10 rounded-full border object-cover"/>
                <ng-template #init><div class="flex h-10 w-10 items-center justify-center rounded-full text-white" style="background: var(--brand-azure)">{{(c.label||'S').slice(0,1)}}</div></ng-template>
                <span *ngIf="(c.unread||0)>0" class="absolute -top-1 -right-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-semibold text-white ring-2 ring-white">{{ c.unread }}</span>
                <span *ngIf="c.online" class="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white"></span>
              </span>
              <div class="min-w-0 flex-1">
                <div class="flex items-center justify-between gap-2">
                  <div class="truncate text-sm font-medium text-gray-900">{{ c.label }}</div>
                  <div class="whitespace-nowrap text-[11px] text-gray-500">{{ formatTime(c.updatedAt) }}</div>
                </div>
                <div class="truncate text-xs text-gray-600">
                  <ng-container *ngIf="!c.typing; else typingTpl">{{ lastMessageText(c) || c.preview || 'New conversation' }}</ng-container>
                  <ng-template #typingTpl>
                    <span class="typing-dots align-middle"><span></span><span></span><span></span></span>
                  </ng-template>
                </div>
              </div>
            </button>
            <div *ngIf="!filteredConversations().length" class="px-3 py-8 text-sm text-gray-500">No conversations</div>
          </div>
        </aside>

        <section class="flex min-h-[320px] flex-col bg-white lg:min-h-0 lg:flex" [class.hidden]="mobilePane()==='list'">
          <div class="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 sm:px-5">
            <div class="flex min-w-0 items-center gap-3" *ngIf="active() as conv; else empty">
              <button type="button" class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-[#BBD9FF] hover:bg-[#E8F4FF] hover:text-brand-azure lg:hidden" (click)="setMobilePane('list')" aria-label="Back to conversations">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m15 19-7-7 7-7"/></svg>
              </button>
              <img [src]="conv.avatarUrl || '/assets/avatar-placeholder.svg'" class="h-10 w-10 rounded-full border object-cover" alt="avatar"/>
              <div class="min-w-0">
                <div class="truncate text-sm font-semibold text-gray-900 sm:text-base">{{ conv.label }}</div>
                <div class="truncate text-xs text-gray-600">
                  {{ conv.university || 'Setly Member' }}
                  <span *ngIf="conv.location">• {{ conv.location }}</span>
                  <span *ngIf="conv.typing" class="ml-2"><span class="typing-dots align-middle"><span></span><span></span><span></span></span></span>
                  <span *ngIf="!conv.typing && !conv.online && conv.lastSeen" class="ml-2">{{ lastSeenText(conv.lastSeen) }}</span>
                </div>
              </div>
            </div>
            <ng-template #empty>
              <div class="flex w-full items-center justify-between gap-3">
                <div class="text-sm text-gray-500">Select a conversation to start chatting.</div>
                <button type="button" class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-[#BBD9FF] hover:bg-[#E8F4FF] hover:text-brand-azure lg:hidden" (click)="setMobilePane('list')" aria-label="Back to conversations">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m15 19-7-7 7-7"/></svg>
                </button>
              </div>
            </ng-template>
            <button type="button" class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition hover:border-[#BBD9FF] hover:bg-[#E8F4FF] hover:text-brand-azure" title="Conversation info">ℹ️</button>
          </div>

          <div class="flex-1 overflow-y-auto px-4 py-4 sm:px-5" #scrollArea>
            <div *ngIf="active() as conv3; else noConv" class="space-y-3">
              <div *ngFor="let m of conv3.messages; let i=index">
                <div class="my-2 text-center text-[11px] text-gray-400" *ngIf="showTimestamp(conv3.messages, i)">{{ formatDateTime(m.at) }}</div>
                <div class="flex items-end gap-2" [class.justify-end]="m.from==='me'">
                  <div class="relative max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-sm" [ngStyle]="m.from==='me' ? { background: 'var(--brand-gradient)', color: '#fff', borderTopRightRadius: '8px' } : { background: '#F0F2F7', color: '#111827', borderTopLeftRadius: '8px' }">
                    {{ m.text }}
                    <span *ngIf="m.from==='me'" class="absolute -bottom-3 right-1 select-none text-[11px] leading-none" [style.color]="m.status==='read' ? '#BBD9FF' : 'rgba(255,255,255,0.8)'" [title]="statusTitle(m)">{{ statusTicks(m) }}</span>
                  </div>
                  <div *ngIf="m.from==='me'" class="min-w-[28px] select-none text-right text-[11px] leading-none text-gray-400 lg:hidden">
                    <span [ngClass]="statusColor(m)" [title]="statusTitle(m)">{{ statusTicks(m) }}</span>
                  </div>
                </div>
              </div>
            </div>
            <ng-template #noConv>
              <div class="flex h-full items-center justify-center text-sm text-gray-500">Select a conversation to start chatting.</div>
            </ng-template>
          </div>

          <div class="border-t border-gray-100 bg-white px-4 py-3 sm:px-5">
            <div class="flex items-end gap-2 sm:gap-3">
              <textarea #inputEl rows="1" [(ngModel)]="messageText" (input)="onInput()" (keydown.enter)="sendMessage()" placeholder="Type a message" class="flex-1 resize-none rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[rgba(245,199,93,0.45)]"></textarea>
              <button type="button" (click)="sendMessage()" class="rounded-2xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition" [ngStyle]="{ background: 'var(--brand-gradient)' }" [disabled]="!messageText.trim()">Send</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  </main>
  `
})
export class MessagesPage implements OnInit {
  private route = inject(ActivatedRoute);
  private store = inject(ConversationStoreService);
  private gateway = inject(MessageGatewayService);
  private demoSeeded = false;
  messageText = '';
  inboxQuery = '';
  // Define filter type as a string literal union and use a const list for strong typing in template
  readonly filtersList = ['All','Unread','Active','Connections','Verified'] as const;
  readonly currentFilter = signal<(typeof this.filtersList)[number]>('All');
  readonly mobilePane = signal<'list' | 'chat'>('list');
  get conversations(){ return this.store.conversations(); }
  get activeId(){ return this.store['activeId'](); }
  totalUnread(){ return this.store.unreadTotal(); }
  filteredConversations: Signal<Conversation[]> = computed(() => {
    const q = this.inboxQuery.trim().toLowerCase();
    let list = this.conversations;
    if (this.currentFilter()==='Unread') list = list.filter(c => (c.unread||0) > 0);
    if (this.currentFilter()==='Active') list = list.filter(c => !!c.typing || !!c.online);
    // Connections/Verified filters can be wired to real data later
    if (q) list = list.filter(c => (c.label||'').toLowerCase().includes(q) || (this.lastMessageText(c)||'').toLowerCase().includes(q));
    // Sort: Active first if Active filter to bubble typing, else by updatedAt desc
    if (this.currentFilter()==='Active') {
      list = list.slice().sort((a,b) => Number(!!b.typing || !!b.online) - Number(!!a.typing || !!a.online));
    } else {
      list = list.slice().sort((a,b) => (Date.parse(b.updatedAt||'0') || 0) - (Date.parse(a.updatedAt||'0') || 0));
    }
    return list;
  });
  @ViewChild('inputEl') inputEl?: ElementRef<HTMLTextAreaElement>;
  @ViewChild('scrollArea') scrollArea?: ElementRef<HTMLDivElement>;

  ngOnInit(): void {
    // Establish real-time connection (SSE)
    this.gateway.connect();
    // Start presence tracker (heartbeat + online fetch)
    this.gateway.startPresence();
    // Seed inbox from Threads API; fall back to demo data when nothing is returned
    this.gateway.getThreads()
      .then(list => {
        if (Array.isArray(list) && list.length) {
          this.gateway.mergeThreads(list);
        } else {
          this.seedDemoInbox();
        }
      })
      .catch(() => this.seedDemoInbox());
    // Prefill message from query param if provided
    const qp = this.route.snapshot.queryParamMap;
    const text = qp.get('text');
    const withId = qp.get('with') || undefined;
    const market = qp.get('market') || qp.get('listing') || undefined; // support legacy 'listing' param
    const name = qp.get('name') || undefined;
    const avatar = qp.get('avatar') || undefined;
    if (withId) {
      this.store.ensure(withId, name || withId, market, avatar);
      // proactively mark as read when opened via deep link
      this.gateway.markRead(withId, market).catch(() => {});
      this.focusChatOnMobile();
    }
    if (text) this.messageText = text; else if (withId) this.messageText = this.loadDraft(withId) || '';

    // Auto-scroll when near bottom on new messages in active conversation
    effect(() => {
      const conv = this.active();
      if (!conv && this.mobilePane()==='chat' && !this.isDesktopWidth()) {
        this.mobilePane.set('list');
      }
      const len = conv?.messages?.length || 0; // track
      if (!len) return;
      setTimeout(() => {
        const el = this.scrollArea?.nativeElement;
        if (!el) return;
        const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
        if (distance < 120) this.scrollToBottom();
      }, 0);
    });
  }

  sendMessage(): void {
    if (this.messageText.trim()) {
      const conv = this.active();
      if (conv) {
        const trimmed = this.messageText.trim();
        this.store.addMessage(conv.id, trimmed); // optimistic
        // fire-and-forget send to backend (include known name/avatar for receiver UX)
        this.gateway.send(conv.id, trimmed, conv.market, conv.label, conv.avatarUrl).catch(() => {});
        // optional: auto-scroll
        setTimeout(() => this.scrollToBottom(), 0);
        // clear draft for this thread
        this.saveDraft(conv.id, '');
      }
      console.log('Sending message:', this.messageText);
      this.messageText = '';
      setTimeout(() => this.inputEl?.nativeElement.focus(), 0);
    }
  }

  ensureConversation(withId: string, market?: string) {
    this.store.ensure(withId, withId, market);
    this.focusChatOnMobile();
    setTimeout(() => this.inputEl?.nativeElement.focus(), 0);
  }
  // When a conversation becomes active and has no history, lazily load from backend
  select(id: string){
    this.store.setActive(id);
    // Load draft text for this thread
    this.messageText = this.loadDraft(id) || '';
    const conv = this.store['list']().find((c: any) => c.id === id);
    if (conv && (!conv.messages || conv.messages.length === 0)) {
      this.gateway.loadHistory(id, conv.market);
    }
    // Notify backend to mark incoming messages from counterpart as read
    if (conv) this.gateway.markRead(id, conv.market).catch(() => {});
    this.focusChatOnMobile();
  }
  active(){ return this.store.active(); }

  // UI helpers
  lastMessageText(c: Conversation): string | null {
    const m = (c.messages||[])[(c.messages||[]).length-1];
    return m ? m.text : null;
  }
  formatTime(iso?: string){ if (!iso) return ''; const d = new Date(iso); return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }); }
  formatDateTime(iso: string){ try { const d = new Date(iso); return d.toLocaleString(undefined, { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }); } catch { return iso; } }
  lastSeenText(ts?: number){
    if (!ts) return '';
    const diff = Date.now() - ts;
    if (diff < 60_000) return 'Last seen just now';
    const m = Math.floor(diff / 60_000);
    if (m < 60) return `Last seen ${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `Last seen ${h}h ago`;
    const d = Math.floor(h / 24);
    return `Last seen ${d}d ago`;
  }
  showTimestamp(list: Message[], index: number): boolean {
    if (index === 0) return true;
    const prev = Date.parse(list[index-1].at||'');
    const cur = Date.parse(list[index].at||'');
    return cur - prev > 30*60*1000; // every 30 min gap
  }
  statusTicks(m: Message): string {
    switch (m.status) {
      case 'read': return '✓✓';
      case 'delivered': return '✓✓';
      case 'sending':
      default: return '✓';
    }
  }
  statusColor(m: Message): string {
    if (m.status === 'read') return 'text-blue-500';
    return 'text-gray-400';
  }
  statusTitle(m: Message): string {
    switch (m.status) {
      case 'read': return 'Read';
      case 'delivered': return 'Delivered';
      case 'sending': return 'Sending…';
      default: return 'Sent';
    }
  }
  setMobilePane(view: 'list' | 'chat') {
    if (view === 'chat' && !this.active()) {
      const first = this.conversations[0];
      if (first) {
        this.select(first.id);
      }
    }
    if (this.mobilePane() !== view) {
      this.mobilePane.set(view);
    }
    if (view === 'chat') {
      setTimeout(() => this.scrollToBottom(), 0);
    }
  }
  private focusChatOnMobile() {
    if (!this.isDesktopWidth()) {
      this.mobilePane.set('chat');
    }
  }
  private isDesktopWidth(): boolean {
    if (typeof window === 'undefined') return true;
    return window.matchMedia('(min-width: 1024px)').matches;
  }
  scrollToBottom(){ try { const el = this.scrollArea?.nativeElement; if (el) el.scrollTop = el.scrollHeight; } catch {}
  }
  noop(){}
  onInput(){
    const conv = this.active();
    if (conv) {
      this.gateway.sendTyping(conv.id, true, conv.market);
      this.saveDraft(conv.id, this.messageText || '');
    }
  }

  // Draft persistence helpers
  private draftKey = 'message-drafts-v1';
  private saveDraft(id: string, text: string){
    try {
      const raw = localStorage.getItem(this.draftKey);
      const obj = raw ? JSON.parse(raw) as Record<string,string> : {};
      if (text) obj[id] = text; else delete obj[id];
      localStorage.setItem(this.draftKey, JSON.stringify(obj));
    } catch {}
  }
  private loadDraft(id: string): string | null {
    try {
      const raw = localStorage.getItem(this.draftKey);
      const obj = raw ? JSON.parse(raw) as Record<string,string> : {};
      return obj[id] || null;
    } catch { return null; }
  }

  private seedDemoInbox(){
    if (this.demoSeeded) return;
    try {
      const existing = this.store.conversations();
      if (existing && existing.length) return;
    } catch {
      // ignore inability to introspect store
    }
    const base = Date.now();
    const minutesAgo = (mins: number) => new Date(base - mins * 60_000).toISOString();
    const samples: Array<{ id: string; label: string; avatarUrl?: string; messages: Message[]; unread?: number; university?: string; location?: string }> = [
      {
        id: 'sofia-harper',
        label: 'Sofia Harper',
        avatarUrl: 'https://images.setly.dev/avatars/sofia.png',
        university: 'Northeastern University',
        location: 'Boston, MA',
        messages: [
          { text: 'Hi! I loved your Mission Hill room tour – is it still available for February move-in?', from: 'them', at: minutesAgo(310) },
          { text: 'Hey Sofia! Yes, February 3 works perfectly. Happy to hold it for you.', from: 'me', at: minutesAgo(304), status: 'read' },
          { text: 'Amazing, thank you. Can we schedule a quick video walkthrough this weekend?', from: 'them', at: minutesAgo(299) }
        ],
        unread: 1
      },
      {
        id: 'evan-chen',
        label: 'Evan Chen',
        avatarUrl: 'https://images.setly.dev/avatars/evan.png',
        university: 'Boston University',
        location: 'Back Bay',
        messages: [
          { text: 'Carpool to Logan still on? I can swing by 30 mins earlier if that helps.', from: 'them', at: minutesAgo(180) },
          { text: 'Earlier is great – I’ll be ready downstairs at 7:30am.', from: 'me', at: minutesAgo(176), status: 'read' },
          { text: 'Perfect, see you then!', from: 'them', at: minutesAgo(173) }
        ]
      },
      {
        id: 'leah-bowers',
        label: 'Leah Bowers',
        avatarUrl: 'https://images.setly.dev/avatars/leah.png',
        university: 'Parsons School of Design',
        location: 'New York, NY',
        messages: [
          { text: 'Your adjustable standing desk looks perfect for my studio 🪑 Any scratches I should know about?', from: 'them', at: minutesAgo(90) },
          { text: 'It’s in great shape – just a tiny scuff on the back leg. I can send close-ups if you’d like.', from: 'me', at: minutesAgo(84), status: 'read' },
          { text: 'That works! Could I pick it up Sunday afternoon?', from: 'them', at: minutesAgo(80) }
        ],
        unread: 1
      }
    ];

    let firstId: string | null = null;
    for (const sample of samples) {
      const conv = this.store.ensure(sample.id, sample.label, undefined, sample.avatarUrl);
      if (!firstId) firstId = conv.id;
      const history = sample.messages.map(m => ({ ...m }));
      this.store.setHistory(conv.id, history);
      const last = history[history.length - 1];
      this.store.setThreadSummary(conv.id, {
        label: sample.label,
        avatarUrl: sample.avatarUrl,
        lastText: last?.text,
        lastFrom: last?.from,
        lastAt: last?.at,
        unread: sample.unread || 0
      });
    }
    if (firstId) this.store.setActive(firstId);
    this.demoSeeded = true;
  }
}
