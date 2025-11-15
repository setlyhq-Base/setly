import type { Response } from 'express';

export interface RealtimeMessage {
  id: string;
  from: string;
  to: string;
  text: string;
  at: string; // ISO
  market?: string; // optional listing context
  name?: string;   // optional display name for sender
  avatar?: string; // optional avatar url for sender
}

function convKey(a: string, b: string, market?: string){
  const [x,y] = [a,b].sort();
  return `${x}:${y}:${market||''}`;
}

/**
 * Very lightweight in-memory messaging hub for development.
 * - Stores recent messages in memory per conversation key
 * - Fan-outs messages to connected SSE clients per user
 * Not production-grade; replace with DB + WebSocket broker in prod.
 */
class MessagesHub {
  private clients = new Map<string, Set<Response>>();
  private wsClients = new Map<string, Set<any>>(); // any = WebSocket
  private history = new Map<string, RealtimeMessage[]>();

  addClient(userId: string, res: Response){
    if (!this.clients.has(userId)) this.clients.set(userId, new Set());
    this.clients.get(userId)!.add(res);
  }
  removeClient(userId: string, res: Response){
    const set = this.clients.get(userId);
    if (set) { set.delete(res); if (!set.size) this.clients.delete(userId); }
  }
  addWsClient(userId: string, ws: any){
    if (!this.wsClients.has(userId)) this.wsClients.set(userId, new Set());
    this.wsClients.get(userId)!.add(ws);
  }
  removeWsClient(userId: string, ws: any){
    const set = this.wsClients.get(userId);
    if (set) { set.delete(ws); if (!set.size) this.wsClients.delete(userId); }
  }
  send(from: string, to: string, text: string, market?: string, meta?: { name?: string; avatar?: string }): RealtimeMessage {
    const msg: RealtimeMessage = { id: `m_${Date.now()}_${Math.random().toString(36).slice(2,8)}`, from, to, text, at: new Date().toISOString(), market, name: meta?.name, avatar: meta?.avatar };
    const key = convKey(from, to, market);
    const arr = this.history.get(key) || [];
    arr.push(msg);
    // Cap to last 200 messages for dev
    if (arr.length > 200) arr.splice(0, arr.length - 200);
    this.history.set(key, arr);
    // Fanout to recipient and sender if connected
    this.emit(to, { type: 'message', message: msg });
    this.emit(from, { type: 'ack', message: msg });
    return msg;
  }
  getHistory(a: string, b: string, market?: string){
    return (this.history.get(convKey(a,b,market)) || []).slice();
  }
  emit(userId: string, payload: any){
    const set = this.clients.get(userId);
    const data = `data: ${JSON.stringify(payload)}\n\n`;
    if (set && set.size) {
      for (const res of set) {
        try { res.write(data); } catch {}
      }
    }
    const wsset = this.wsClients.get(userId);
    if (wsset && wsset.size) {
      const json = JSON.stringify(payload);
      for (const ws of wsset) { try { ws.send(json); } catch {} }
    }
  }

  broadcast(payload: any){
    const json = JSON.stringify(payload);
    const data = `data: ${json}\n\n`;
    for (const [_, set] of this.clients.entries()) {
      for (const res of set) { try { res.write(data); } catch {} }
    }
    for (const [_, set] of this.wsClients.entries()) {
      for (const ws of set) { try { ws.send(json); } catch {} }
    }
  }
}

export const messagesHub = new MessagesHub();
