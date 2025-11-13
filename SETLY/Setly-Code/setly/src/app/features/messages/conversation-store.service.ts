import { Injectable, signal } from '@angular/core';

export interface Conversation {
  id: string; // user id of the other party
  label: string;
  market?: string; // listing id if any
  messages: string[];
}

const STORAGE_KEY = 'setly.conversations.v1';

@Injectable({ providedIn: 'root' })
export class ConversationStoreService {
  private list = signal<Conversation[]>(this.load());
  private activeId = signal<string | null>(null);

  conversations = this.list.asReadonly();
  active = signal<Conversation | null>(null);

  constructor(){
    this.updateActive();
  }

  ensure(id: string, label: string, market?: string){
    let conv = this.list().find(c => c.id === id && c.market === market);
    if (!conv) {
      conv = { id, label, market, messages: [] };
      this.list.update(arr => [conv!, ...arr]);
      this.persist();
    }
    this.setActive(conv.id);
    return conv;
  }

  addMessage(id: string, text: string){
    this.list.update(arr => arr.map(c => c.id === id ? { ...c, messages: [...c.messages, text] } : c));
    this.persist();
    this.updateActive();
  }

  setActive(id: string | null){
    this.activeId.set(id);
    this.updateActive();
  }

  private updateActive(){
    const conv = this.list().find(c => c.id === this.activeId());
    this.active.set(conv || null);
  }

  private persist(){
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.list())); } catch {}
  }
  private load(): Conversation[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  }
}
