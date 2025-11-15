import { Injectable, computed, signal } from '@angular/core';

export interface Conversation {
  id: string; // user id of the other party
  label: string;
  market?: string; // listing id if any
  avatarUrl?: string;
  university?: string;
  location?: string;
  messages: Message[];
  unread?: number;
  updatedAt?: string; // ISO
  // preview data from Threads API when history not loaded yet
  preview?: string;
  lastFrom?: 'me'|'them';
  online?: boolean;
  typing?: boolean;
  lastSeen?: number;
}

export interface Message {
  id?: string; // server id when available
  text: string;
  from: 'me'|'them';
  at: string; // ISO
  status?: 'sending'|'delivered'|'read'; // only meaningful for from==='me'
}

const STORAGE_KEY = 'setly.conversations.v1';

@Injectable({ providedIn: 'root' })
export class ConversationStoreService {
  private list = signal<Conversation[]>(this.load());
  private activeId = signal<string | null>(null);
  private typingTimers = new Map<string, any>();

  conversations = computed(() => this.list()
    .slice()
    .sort((a,b) => (Date.parse(b.updatedAt||'')||0) - (Date.parse(a.updatedAt||'')||0))
  );
  // Total unread across conversations for global badge
  unreadTotal = computed(() => this.list().reduce((sum, c) => sum + (c.unread || 0), 0));
  active = signal<Conversation | null>(null);

  constructor(){
    this.updateActive();
  }

  ensure(id: string, label: string, market?: string, avatarUrl?: string){
    let conv = this.list().find(c => c.id === id && c.market === market);
    if (!conv) {
      conv = { id, label, market, avatarUrl, messages: [], unread: 0, updatedAt: new Date().toISOString() };
      this.list.update(arr => [conv!, ...arr]);
      this.persist();
    }
    this.setActive(conv.id);
    return conv;
  }

  addMessage(id: string, text: string){
    const msg: Message = { text, from: 'me', at: new Date().toISOString(), status: 'sending' };
    this.list.update(arr => arr.map(c => c.id === id ? { ...c, messages: [...c.messages, msg], updatedAt: msg.at } : c));
    this.persist();
    this.updateActive();
  }

  addIncoming(id: string, text: string, serverId?: string){
    const msg: Message = { id: serverId, text, from: 'them', at: new Date().toISOString() };
    this.list.update(arr => arr.map(c => c.id === id ? { ...c, messages: [...c.messages, msg], unread: (c.unread||0)+1, updatedAt: msg.at } : c));
    this.persist();
    this.updateActive();
  }

  // After server ack, mark the last outgoing message as delivered and attach server id
  markLastOutgoingDelivered(convId: string, serverId: string){
    this.list.update(arr => arr.map(c => {
      if (c.id !== convId) return c;
      const msgs = [...c.messages];
      for (let i = msgs.length - 1; i >= 0; i--) {
        const m = msgs[i];
        if (m.from === 'me') { msgs[i] = { ...m, id: serverId, status: 'delivered' }; break; }
      }
      return { ...c, messages: msgs };
    }));
    this.persist();
  }

  // When recipient reads the conversation, mark all my outgoing messages as read
  markOutgoingRead(convId: string){
    this.list.update(arr => arr.map(c => {
      if (c.id !== convId) return c;
      const msgs = c.messages.map(m => m.from==='me' ? { ...m, status: 'read' as const } : m);
      return { ...c, messages: msgs };
    }));
    this.persist();
  }

  setActive(id: string | null){
    this.activeId.set(id);
    this.updateActive();
  }

  private updateActive(){
    const conv = this.list().find(c => c.id === this.activeId());
    if (conv) {
      // Mark read when opened
      if (conv.unread) conv.unread = 0;
      this.active.set({ ...conv });
      this.persist();
    } else {
      this.active.set(null);
    }
  }

  private persist(){
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.list())); } catch {}
  }
  // Replace an entire conversation's message history (used when fetching from backend)
  setHistory(id: string, messages: Message[]){
    let exists = false;
    this.list.update(arr => arr.map(c => {
      if (c.id !== id) return c;
      exists = true;
      const updatedAt = messages.length ? messages[messages.length - 1].at : c.updatedAt;
      return { ...c, messages: messages.slice(), unread: c.unread || 0, updatedAt };
    }));
    if (!exists) {
      this.list.update(arr => [...arr, { id, label: id, messages: messages.slice(), unread: 0, updatedAt: messages.length ? messages[messages.length - 1].at : undefined }]);
    }
    this.persist();
    this.updateActive();
  }

  // Merge thread summary info from Threads API
  setThreadSummary(id: string, data: { label?: string; avatarUrl?: string; market?: string; lastText?: string; lastFrom?: 'me'|'them'; lastAt?: string; unread?: number }){
    let exists = false;
    this.list.update(arr => arr.map(c => {
      if (c.id !== id || (data.market && c.market !== data.market)) return c;
      exists = true;
      const updatedAt = data.lastAt || c.updatedAt;
      return { ...c, label: data.label || c.label, avatarUrl: data.avatarUrl || c.avatarUrl, market: data.market || c.market, preview: data.lastText ?? c.preview, lastFrom: data.lastFrom ?? c.lastFrom, unread: data.unread ?? c.unread, updatedAt };
    }));
    if (!exists) {
      const conv: Conversation = { id, label: data.label || id, market: data.market, avatarUrl: data.avatarUrl, messages: [], unread: data.unread || 0, updatedAt: data.lastAt, preview: data.lastText, lastFrom: data.lastFrom };
      this.list.update(arr => [conv, ...arr]);
    }
    this.persist();
    this.updateActive();
  }

  setTyping(id: string, on: boolean){
    // update flag
    this.list.update(arr => arr.map(c => c.id === id ? { ...c, typing: on } : c));
    // auto-clear after 5s
    const existing = this.typingTimers.get(id);
    if (existing) { try { clearTimeout(existing); } catch {} }
    if (on) {
      const t = setTimeout(() => {
        this.list.update(arr => arr.map(c => c.id === id ? { ...c, typing: false } : c));
        this.typingTimers.delete(id);
      }, 5000);
      this.typingTimers.set(id, t);
    }
    this.updateActive();
  }

  mergeOnline(onlineIds: string[]){
    const set = new Set(onlineIds);
    this.list.update(arr => arr.map(c => ({ ...c, online: set.has(c.id) })));
    this.updateActive();
  }

  mergePresenceMap(map: Record<string, number>){
    this.list.update(arr => arr.map(c => ({ ...c, lastSeen: map[c.id] || c.lastSeen })));
    this.updateActive();
  }

  setOnline(id: string, online: boolean){
    this.list.update(arr => arr.map(c => c.id === id ? { ...c, online } : c));
    this.updateActive();
  }
  private load(): Conversation[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      // migrate old messages:string[] to Message[]
      return parsed.map((c: any) => {
        const msgs: any[] = Array.isArray(c.messages) ? c.messages : [];
        const upgraded: Message[] = msgs.map((m: any) => typeof m === 'string' ? ({ text: m, from: 'me', at: new Date().toISOString(), status: 'delivered' }) : m);
        const updatedAt = c.updatedAt || (upgraded.length ? upgraded[upgraded.length-1].at : undefined);
        return { ...c, messages: upgraded, unread: c.unread || 0, updatedAt } as Conversation;
      });
    } catch { return []; }
  }
}
