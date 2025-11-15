import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { AuthStore } from '../../core/state/auth.store';
import { ConversationStoreService } from './conversation-store.service';

@Injectable({ providedIn: 'root' })
export class MessageGatewayService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private store = inject(ConversationStoreService);
  private authStore = inject(AuthStore);
  private es?: EventSource;
  private ws?: WebSocket;
  private connected = false;

  async connect(): Promise<void> {
    if (this.connected) return;
    const token = await this.auth.getIdToken();
    // Try WebSocket first
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    const wsUrl = `${proto}://${location.host}/api/messages/ws${token ? `?token=${encodeURIComponent(token)}` : ''}`;
    try {
      if (this.ws) { try { this.ws.close(); } catch {} }
      const ws = new WebSocket(wsUrl);
      ws.onopen = () => { this.connected = true; };
      ws.onerror = () => { /* will fallback to SSE in onclose */ };
      ws.onclose = () => { if (!this.connected) this.connectSSE(token); };
      ws.onmessage = (ev) => {
        try {
          const payload = JSON.parse(ev.data || '{}');
          this.handleRealtimePayload(payload);
        } catch {}
      };
      this.ws = ws;
    } catch {
      // Fallback to SSE if WS fails immediately
      this.connectSSE(token);
    }
  }

  private connectSSE(token?: string | null){
    const url = token ? `/api/messages/stream?token=${encodeURIComponent(token)}` : '/api/messages/stream';
    if (this.es) { try { this.es.close(); } catch {} }
    const es = new EventSource(url, { withCredentials: true });
    es.onopen = () => { this.connected = true; };
    es.onerror = () => { this.connected = false; };
    es.onmessage = (ev) => {
      try {
        const payload = JSON.parse(ev.data || '{}');
        this.handleRealtimePayload(payload);
      } catch {}
    };
    this.es = es;
  }

  private handleRealtimePayload(payload: any){
    if (payload?.type === 'message' && payload.message) {
      const m = payload.message as { id?: string; from: string; text: string; market?: string; name?: string; avatar?: string };
      this.store.ensure(m.from, m.name || m.from, m.market, m.avatar);
      this.store.addIncoming(m.from, m.text, m.id);
      // Desktop notification when page isn't focused/visible
      this.notifyNewMessageSafe(m);
    } else if (payload?.type === 'ack' && payload.message) {
      const m = payload.message as { id: string; to: string; market?: string };
      this.store.markLastOutgoingDelivered(m.to, m.id);
    } else if (payload?.type === 'read') {
      const other = payload.with as string;
      if (other) this.store.markOutgoingRead(other);
    } else if (payload?.type === 'typing') {
      const other = payload.with as string;
      const on = !!payload.isTyping;
      if (other) this.store.setTyping(other, on);
    } else if (payload?.type === 'threads' && Array.isArray(payload.threads)) {
      // Optional: handle threads pushed via WS if server supports
      this.mergeThreads(payload.threads);
    } else if (payload?.type === 'presence') {
      const uid = payload.userId as string;
      const online = !!payload.online;
      const lastSeen = typeof payload.lastSeen === 'number' ? payload.lastSeen : undefined;
      if (uid) {
        // Update a single user's presence by merging map and online flag
        this.store.mergePresenceMap({ [uid]: lastSeen || Date.now() });
        this.store.setOnline(uid, online);
      }
    }
  }

  private notifyNewMessageSafe(m: { from: string; text: string; name?: string; avatar?: string }){
    try {
      const NotificationCtor: any = (globalThis as any).Notification;
      if (!NotificationCtor) return;
      const isHidden = typeof document !== 'undefined' && document.visibilityState === 'hidden';
      const notFocused = typeof document !== 'undefined' && (typeof document.hasFocus === 'function') ? !document.hasFocus() : false;
      if (!isHidden && !notFocused) return; // only notify when not focused or hidden
      const doShow = () => {
        try {
          const n = new NotificationCtor(m.name || m.from, { body: m.text, icon: m.avatar || '/assets/icons/icon-192x192.png' });
          n.onclick = () => { try { window.focus(); n.close(); } catch {} };
        } catch {}
      };
      if (NotificationCtor.permission === 'granted') return void doShow();
      if (NotificationCtor.permission === 'default') {
        NotificationCtor.requestPermission?.().then((p: string) => { if (p === 'granted') doShow(); }).catch(() => {});
      }
    } catch {}
  }

  async send(to: string, text: string, market?: string, name?: string, avatar?: string) {
    const body: any = { to, text };
    if (market) body.market = market;
    if (name) body.name = name;
    if (avatar) body.avatar = avatar;
    try {
      const res: any = await this.http.post('/api/messages/send', body).toPromise();
      const id = res?.message?.id as string | undefined;
      if (id) this.store.markLastOutgoingDelivered(to, id);
      return res;
    } catch (e) {
      // leave message in 'sending' state; SSE ack may still arrive later
      throw e;
    }
  }

  async loadHistory(withId: string, market?: string){
    const params: any = { with: withId };
    if (market) params.market = market;
    try {
      const res: any = await this.http.get('/api/messages/history', { params }).toPromise();
      const me = this.authStore.user().userId;
      const items = Array.isArray(res?.items) ? res.items : [];
      const history = items.map((m: any) => ({ id: m.id, text: m.text, from: m.from === me ? 'me' : 'them', at: m.at, status: (m.from === me ? (m.readAt ? 'read' : 'delivered') : undefined) })) as any[];
      // Ensure exists then upsert history
      const conv = this.store.ensure(withId, withId, market);
      this.store.setHistory(conv.id, history as any);
    } catch {}
  }

  async markRead(withId: string, market?: string){
    const body: any = { with: withId };
    if (market) body.market = market;
    try {
      await this.http.post('/api/messages/read', body).toPromise();
    } catch {}
  }

  async getThreads(): Promise<Array<{ with: string; market?: string; lastText?: string; lastAt?: string; lastFrom?: 'me'|'them'; unread: number }>>{
    try {
      const res: any = await this.http.get('/api/messages/threads').toPromise();
      const threads = Array.isArray(res?.threads) ? res.threads : [];
      return threads;
    } catch {
      return [];
    }
  }

  mergeThreads(threads: Array<{ with: string; market?: string; lastText?: string; lastAt?: string; lastFrom?: 'me'|'them'; unread: number }>) {
    for (const t of threads) {
      this.store.setThreadSummary(t.with, { market: t.market, lastText: t.lastText, lastFrom: t.lastFrom, lastAt: t.lastAt, unread: t.unread });
    }
  }

  sendTyping(to: string, isTyping: boolean, market?: string){
    // Throttle 'true' and send 'false' after idle 2s
    const key = `${to}:${market || ''}`;
    (this as any)._typingLast = (this as any)._typingLast || new Map<string, number>();
    (this as any)._typingStopTimers = (this as any)._typingStopTimers || new Map<string, any>();
    const lastMap: Map<string, number> = (this as any)._typingLast;
    const stopMap: Map<string, any> = (this as any)._typingStopTimers;
    const now = Date.now();
    const last = lastMap.get(key) || 0;
    const shouldSendTrue = isTyping && (now - last > 2000);
    const shouldSendFalse = !isTyping;
    const send = (flag: boolean) => {
      try {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          const payload: any = { type: 'typing', to, isTyping: flag };
          if (market) payload.market = market;
          this.ws.send(JSON.stringify(payload));
        }
      } catch {}
    };
    if (shouldSendTrue) { send(true); lastMap.set(key, now); }
    // schedule stop after 2s of inactivity
    const existing = stopMap.get(key);
    if (existing) { try { clearTimeout(existing); } catch {} }
    const t = setTimeout(() => { send(false); stopMap.delete(key); lastMap.set(key, 0); }, 2000);
    stopMap.set(key, t);
  }

  // Presence helpers
  private presenceInterval?: any;
  startPresence(){
    // Heartbeat every 30s and refresh online users
    const beat = async () => { try { await this.http.post('/api/presence/heartbeat', {}).toPromise(); } catch {} };
    const refresh = async () => {
      try {
        const res: any = await this.http.get('/api/presence/online').toPromise();
        const list: string[] = Array.isArray(res?.online) ? res.online : [];
        this.store.mergeOnline(list);
        if (res?.map && typeof res.map === 'object') this.store.mergePresenceMap(res.map as Record<string, number>);
      } catch {}
    };
    beat(); refresh();
    if (this.presenceInterval) { try { clearInterval(this.presenceInterval); } catch {} }
    this.presenceInterval = setInterval(() => { beat(); refresh(); }, 30_000);
  }
}
