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
    .typing-dots span { display:inline-block; width:3px; height:3px; margin:0 1px; border-radius:50%; background:#6366f1; opacity:0.6; animation: tdots 1.1s infinite; }
    .typing-dots span:nth-child(2){ animation-delay: .2s; }
    .typing-dots span:nth-child(3){ animation-delay: .4s; }
    @keyframes tdots { 0%, 80%, 100% { transform: translateY(0); opacity:.4 } 40% { transform: translateY(-2px); opacity:1 } }
  </style>
  <main class="min-h-screen bg-white" data-testid="messages-page">
    <div class="max-w-[1500px] mx-auto h-[calc(100vh-var(--header-height,64px))] px-4 md:px-6 py-4">
      <div class="h-full rounded-2xl border border-gray-200 shadow-sm overflow-hidden grid" style="grid-template-columns: 320px 1fr;">
        <!-- LEFT: Inbox -->
        <aside class="h-full bg-white border-r border-gray-100">
          <!-- Inbox header -->
          <div class="px-4 pt-4 pb-3 border-b border-gray-100">
            <div class="flex items-center justify-between mb-2">
              <h2 class="text-xl font-bold text-gray-900">Chats</h2>
              <div class="flex items-center gap-2">
                <button class="p-2 rounded-lg border text-gray-600" title="New message">✉️</button>
                <button class="p-2 rounded-lg border text-gray-600" title="Options">⋯</button>
              </div>
            </div>
            <input type="search" [(ngModel)]="inboxQuery" (input)="noop()" class="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Search messages…" />
            <div class="mt-3 flex items-center gap-2 overflow-x-auto pb-1 text-sm">
              <button *ngFor="let f of filtersList" (click)="currentFilter.set(f)" class="px-3 py-1 rounded-md border bg-white"
                      [class.text-indigo-700]="currentFilter()==f" [class.border-indigo-200]="currentFilter()==f" [class.bg-indigo-50]="currentFilter()==f">
                {{ f }}
              </button>
            </div>
          </div>

          <!-- Inbox list -->
          <div class="h-[calc(100%-120px)] overflow-y-auto px-2 py-2">
            <button *ngFor="let c of filteredConversations()" (click)="select(c.id)"
                    class="w-full text-left px-3 py-3 rounded-xl flex items-center gap-3 hover:bg-gray-50 relative"
                    [class.bg-indigo-50]="activeId===c.id">
              <span class="relative inline-block">
                <img *ngIf="c.avatarUrl; else init" [src]="c.avatarUrl" alt="avatar" class="w-10 h-10 rounded-full object-cover border"/>
                <ng-template #init><div class="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center">{{(c.label||'S').slice(0,1)}}</div></ng-template>
                <span *ngIf="(c.unread||0)>0" class="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-white text-[10px] leading-[18px] text-center ring-2 ring-white">{{ c.unread }}</span>
                <span *ngIf="c.online" class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white"></span>
              </span>
              <span class="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" [class.bg-indigo-500]="activeId===c.id"></span>
              <div class="min-w-0 flex-1">
                <div class="flex items-center justify-between gap-2">
                  <div class="font-medium text-gray-900 truncate">{{ c.label }}</div>
                  <div class="text-[11px] text-gray-500 whitespace-nowrap">{{ formatTime(c.updatedAt) }}</div>
                </div>
                <div class="text-xs text-gray-600 truncate">
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

        <!-- RIGHT: Chat window -->
        <section class="h-full bg-white grid" style="grid-template-rows: auto 1fr auto;">
          <!-- Chat header -->
          <div class="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <div class="flex items-center gap-3 min-w-0" *ngIf="active() as conv; else empty">
              <img [src]="conv.avatarUrl || '/assets/avatar-placeholder.png'" class="w-10 h-10 rounded-full border object-cover" alt="avatar"/>
              <div class="min-w-0">
                <div class="font-semibold text-gray-900 truncate">{{ conv.label }}</div>
                <div class="text-xs text-gray-600 truncate">{{ conv.university || 'Setly Member' }} <span *ngIf="conv.location">• {{ conv.location }}</span> <span *ngIf="conv.typing" class="ml-2"><span class="typing-dots align-middle"><span></span><span></span><span></span></span></span> <span *ngIf="!conv.typing && !conv.online && conv.lastSeen" class="ml-2">{{ lastSeenText(conv.lastSeen) }}</span></div>
              </div>
            </div>
            <ng-template #empty>
              <div class="text-sm text-gray-500">Select a conversation to start chatting.</div>
            </ng-template>
            <button class="p-2 rounded-lg border text-gray-600" title="Info">ℹ️</button>
          </div>

          <!-- Messages area -->
          <div class="overflow-y-auto px-5 py-4" #scrollArea>
            <div *ngIf="active() as conv3; else noConv">
              <div *ngFor="let m of conv3.messages; let i=index" class="mb-2">
                <div class="text-center text-[11px] text-gray-400 my-2" *ngIf="showTimestamp(conv3.messages, i)">{{ formatDateTime(m.at) }}</div>
                <div class="flex items-end gap-2" [class.justify-end]="m.from==='me'">
                  <div class="relative" [ngClass]="m.from==='me' ? 'bg-gradient-to-r from-[#3A7AFE] to-[#7A5CFF] text-white' : 'bg-[#F0F2F7] text-gray-900'" class="max-w-[70%] px-3 py-2 rounded-2xl shadow-sm"
                       [ngStyle]="m.from==='me' ? { borderTopRightRadius: '8px' } : { borderTopLeftRadius: '8px' }">
                    {{ m.text }}
                    <!-- Optional bottom-right ticks inside bubble -->
                    <span *ngIf="m.from==='me'" class="absolute -bottom-3 right-1 text-[11px] leading-none select-none" [class.text-blue-500]="m.status==='read'" [class.text-gray-300]="m.status!=='read'" [title]="statusTitle(m)">{{ statusTicks(m) }}</span>
                  </div>
                  <!-- Fallback inline ticks to the side for narrow layouts -->
                  <div *ngIf="m.from==='me'" class="text-[11px] leading-none select-none text-gray-400 min-w-[28px] text-right md:hidden">
                    <span [ngClass]="statusColor(m)" [title]="statusTitle(m)">{{ statusTicks(m) }}</span>
                  </div>
                </div>
              </div>
            </div>
            <ng-template #noConv>
              <div class="h-full flex items-center justify-center text-gray-500 text-sm">Select a conversation to start chatting.</div>
            </ng-template>
          </div>

          <!-- Input bar -->
          <div class="px-5 py-3 border-t border-gray-100 bg-white">
            <div class="flex items-end gap-3">
              <textarea #inputEl rows="1" [(ngModel)]="messageText" (input)="onInput()" (keydown.enter)="sendMessage()" placeholder="Type a message" class="flex-1 border rounded-xl px-3 py-2 shadow-sm focus:outline-none" ></textarea>
              <button (click)="sendMessage()" class="px-4 py-2 rounded-xl text-white shadow-sm" [ngStyle]="{ background: 'linear-gradient(90deg,#3A7AFE,#7A5CFF)' }" [disabled]="!messageText.trim()">Send</button>
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
  messageText = '';
  inboxQuery = '';
  // Define filter type as a string literal union and use a const list for strong typing in template
  readonly filtersList = ['All','Unread','Active','Connections','Verified'] as const;
  readonly currentFilter = signal<(typeof this.filtersList)[number]>('All');
  get conversations(){ return this.store.conversations(); }
  get activeId(){ return this.store['activeId'](); }
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
    // Seed inbox from Threads API
    this.gateway.getThreads().then(list => this.gateway.mergeThreads(list));
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
    }
  if (text) this.messageText = text; else if (withId) this.messageText = this.loadDraft(withId) || '';

    // Auto-scroll when near bottom on new messages in active conversation
    effect(() => {
      const conv = this.active();
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
}
