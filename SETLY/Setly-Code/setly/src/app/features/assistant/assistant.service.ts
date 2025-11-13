import { Injectable, signal, computed } from '@angular/core';
import { PLAYBOOKS, PlaybookConfig } from './assistant-playbooks';
import { AnalyticsService } from '../../core/services/analytics.service';
import { environment } from '../../../environments/environment';

export type AssistantMessageType = 'bot' | 'user' | 'room-card' | 'ride-cta' | 'stepper' | 'system';

export interface AssistantMessage {
  id: string;
  type: AssistantMessageType;
  role: 'assistant' | 'user' | 'system';
  content?: string;
  chips?: QuickReplyChip[];
  card?: any; // room/ride/stepper card data union
  createdAt: number;
}

export interface QuickReplyChip { key: string; label: string; icon?: string; }

@Injectable({ providedIn: 'root' })
export class AssistantService {
  // Threaded conversations
  private threadsKey = 'assistantThreadsV1';
  private threadsCurrentKey = 'assistantThreadsCurrentId';
  private _threads = signal<Array<{ id: string; title: string; createdAt: number; updatedAt: number; messages: AssistantMessage[] }>>([]);
  threads = computed(() => this._threads());
  private _currentThreadId = signal<string>('');

  private _messages = signal<AssistantMessage[]>([]);
  messages = computed(() => this._messages());

  private _playbooks = signal<PlaybookConfig[]>(PLAYBOOKS.filter(p => environment.assistant.playbooks.includes(p.key)));
  playbooks = computed(() => this._playbooks());

  private openedOnce = false;
  private storageKey = 'assistantHistory';

  constructor(private analytics: AnalyticsService) {}

  onOpen() {
    if (!this.openedOnce) {
      this.restoreThreads();
      if (this._messages().length === 0) {
        this.seedWelcome();
      }
      this.openedOnce = true;
    }
    this.analytics.fire('assistant_opened');
  }

  onClose() {
    this.analytics.fire('assistant_closed');
  }

  async sendUserMessage(text: string) {
    // Ensure a thread exists
    if (!this._currentThreadId()) this.newThread();
    const user: AssistantMessage = { id: this.genId(), type: 'user', role: 'user', content: text, createdAt: Date.now() };
    this.push(user);
    // If first meaningful user input, auto-title the thread
    this.autoTitleCurrentThread(text);
    this.analytics.fire('assistant_message_sent');

    // Typing indicator immediately
    const typingId = 'typing-' + user.id;
    const typing: AssistantMessage = { id: typingId, type: 'system', role: 'assistant', content: 'typing', createdAt: Date.now() };
    this.push(typing);

    const history = this._messages()
      .filter(x => (x.type === 'user' || x.type === 'bot'))
      .map(x => ({ role: x.role, content: x.content || '' }));

  // Reliability improvements: POST /api/assistant/chat with retries & timeout + dual URL fallback
  // Added offline preflight: if backend unreachable, return local mock reply instead of only a retry chip
    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), 12000);
    const payload = { messages: [...history, { role: 'user', content: text }], max_tokens: 500, temperature: 0.7 };
    // Normalize API URL: allow providing either full /chat endpoint or base /assistant
    const base = (environment.assistant.apiUrl || '/api/assistant').trim();
    const primaryUrl = base.endsWith('/chat') ? base : base.replace(/\/$/, '') + '/chat';
    const fallbackUrl = '/api/assistant/chat'; // proxy-relative

    let attempt = 0;
    const maxAttempts = 4;
    const baseDelay = 200; // ms
    const recentErrors: string[] = [];

    const fetchWithRetries = async (target: string): Promise<Response> => {
      attempt++;
      try {
        return await fetch(target, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: controller.signal
        });
      } catch (err: any) {
        recentErrors.push(err?.message || 'fetch_failed');
        if (attempt >= maxAttempts) throw err;
        const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), 3000);
        await new Promise(r => setTimeout(r, delay));
        return fetchWithRetries(target);
      }
    };

    // Preflight health check (fast): hit the same base host as the primary URL to avoid proxy-only checks
    let backendHealthy = true;
    try {
      const healthController = new AbortController();
      const healthTimeout = setTimeout(() => healthController.abort(), 3000);
      const healthUrl = primaryUrl.replace(/\/chat$/, '/health');
      const healthRes = await fetch(healthUrl, { method: 'GET', signal: healthController.signal });
      clearTimeout(healthTimeout);
      // Treat HTML responses as unhealthy (e.g., dev server index page)
      const contentType = healthRes.headers.get('content-type') || '';
      backendHealthy = healthRes.ok && !contentType.includes('text/html');
    } catch { backendHealthy = false; }

    let usedUrl = primaryUrl;
    try {
      if (!backendHealthy) {
        throw new Error('offline_preflight');
      }
      let res = await fetchWithRetries(primaryUrl);
      if (!res.ok) {
        this.analytics.fire('assistant_error', { code: 'primary_failed_status_' + res.status, url: primaryUrl });
        attempt = 0; // reset for fallback
        usedUrl = fallbackUrl;
        res = await fetchWithRetries(fallbackUrl);
      }
      if (!res.ok) throw new Error('bad_status_' + res.status);
      // Detect HTML error pages (e.g. dev server 404 forwarding) and treat as offline
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('text/html')) {
        throw new Error('html_error_page_' + res.status);
      }
      const data = await res.json();
      this._messages.set(this._messages().filter(m => m.id !== typingId));
      const content = data?.choices?.[0]?.message?.content || 'Assistant reply unavailable.';
      const bot: AssistantMessage = { id: this.genId(), type: 'bot', role: 'assistant', content, createdAt: Date.now() };
      this.push(bot);
      this.analytics.fire('assistant_message_received', { type: 'bot_fetch_complete', url: usedUrl });
    } catch (e: any) {
      this._messages.set(this._messages().filter(m => m.id !== typingId));
      const abort = e?.name === 'AbortError';
      const statusMatch = (e?.message || '').match(/bad_status_(\d+)/);
      const status = statusMatch ? statusMatch[1] : undefined;
      const offline = e?.message === 'offline_preflight';
      const html404Match = (e?.message || '').match(/html_error_page_(\d+)/);
      const htmlStatus = html404Match ? html404Match[1] : undefined;
      const htmlError = htmlStatus === '404';
      const reason = offline || htmlError ? 'backend_offline' : (abort ? 'timeout_12s' : (status ? 'http_' + status : (htmlStatus ? 'http_' + htmlStatus : 'network')));
      if (offline) {
        // Provide a friendly mock assistant response instead of only a retry chip
        const mockContent = 'Backend is offline. Showing mock Setly Assistant reply. Please start the backend on port 3000 to enable real answers.';
        const bot: AssistantMessage = { id: this.genId(), type: 'bot', role: 'assistant', content: mockContent, createdAt: Date.now() };
        this.push(bot);
      } else if (htmlError) {
        const mockContent = 'Assistant backend returned a 404 page. Likely the Node server is not running or proxy failed. Start backend: "npm run dev" in backend folder.';
        const bot: AssistantMessage = { id: this.genId(), type: 'bot', role: 'assistant', content: mockContent, createdAt: Date.now() };
        this.push(bot);
      } else {
        const retryChip: AssistantMessage = { id: this.genId(), type: 'bot', role: 'assistant', content: reason === 'timeout_12s' ? 'Request timed out. Retry?' : 'Network issue. Retry?', chips: [ { key: 'retry-last', label: 'Retry' } ], createdAt: Date.now() };
        this.push(retryChip);
      }
      this.analytics.fire('assistant_error', { code: reason, status, attempt, url: usedUrl, errors: recentErrors.slice(-3) });
    } finally {
      clearTimeout(timeoutHandle);
      this.saveThreads();
    }
  }

  triggerPlaybook(key: string) {
    const pb = this.playbooks().find(p => p.key === key);
    if (!pb) return;
    this.analytics.fire('assistant_playbook_started', { key });
    // For housing start stepper
    if (key === 'housing') {
      this.startHousingStepper();
    } else {
      this.receiveBotMessage(`${pb.title} ⭐\n${pb.benefit}`, [
        { key: 'ask-more', label: 'Next', icon: '➡️' }
      ]);
    }
  }

  suggestChips(chips: QuickReplyChip[]) {
    const m: AssistantMessage = { id: this.genId(), type: 'bot', role: 'assistant', chips, content: 'Choose an option:' , createdAt: Date.now() };
    this.push(m);
    this.analytics.fire('assistant_message_received', { type: 'chips' });
  }

  emitCard(card: any, kind: AssistantMessageType) {
    const m: AssistantMessage = { id: this.genId(), type: kind, role: 'assistant', card, createdAt: Date.now() };
    this.push(m);
    this.analytics.fire('assistant_message_received', { type: kind });
  }

  private receiveBotMessage(text: string, chips: QuickReplyChip[] = []) {
    const m: AssistantMessage = { id: this.genId(), type: 'bot', role: 'assistant', content: text, chips, createdAt: Date.now() };
    this.push(m);
    this.analytics.fire('assistant_message_received', { type: 'bot' });
  }

  private push(m: AssistantMessage) {
    const next = [...this._messages(), m];
    const capped = next.slice(-environment.assistant.maxHistory);
    this._messages.set(capped);
    // Mirror into current thread
    const tid = this._currentThreadId();
    if (tid) {
      const updated = this._threads().map(t => t.id === tid ? { ...t, messages: capped, updatedAt: Date.now() } : t);
      this._threads.set(updated);
      this.saveThreads();
    }
  }

  private seedWelcome() {
    this.receiveBotMessage(`Welcome to Setly Assistant ⭐\nHousing • Rides • Settling in\n\nAsk anything or start a playbook below.`);
  }

  private showTyping() {
    const typing: AssistantMessage = { id: 'typing', type: 'system', role: 'assistant', content: 'typing', createdAt: Date.now() };
    this.push(typing);
    setTimeout(() => {
      // remove typing placeholder
      this._messages.set(this._messages().filter(m => m.id !== 'typing'));
    }, 8000);
  }

  private streamFromBackend(openAiMessages: { role: string; content: string }[]) {
    // Streaming disabled in beta to avoid 404s and instability; fallback to regular send flow.
    // Consolidate messages into a single user prompt reusing retry logic.
    const lastUserContent = openAiMessages.filter(m => m.role === 'user').slice(-1)[0]?.content || 'Hi';
    this.sendUserMessage(lastUserContent);
  }

  // Housing stepper simplified MVP
  private startHousingStepper() {
    this.receiveBotMessage('Let\'s find you a place near campus ⭐\nStep 1: Which university?');
    this.suggestChips([
      { key: 'uni-usc', label: 'USC' },
      { key: 'uni-ucla', label: 'UCLA' },
      { key: 'uni-berkeley', label: 'Berkeley' }
    ]);
  }

  handleChip(key: string) {
    if (key === 'retry-last') {
      // Find last user message before the error chip
      const lastUser = [...this._messages()].reverse().find(m => m.type === 'user');
      if (lastUser?.content) this.sendUserMessage(lastUser.content);
      return;
    }
    // Simple routing based on chip key for MVP
    if (key.startsWith('uni-')) {
      const uni = key.replace('uni-', '').toUpperCase();
      this.receiveBotMessage(`Great – ${uni}. Step 2: Budget range?`, [
        { key: 'budget-800', label: '$800' },
        { key: 'budget-1200', label: '$1200' },
        { key: 'budget-2000', label: '$2000+' }
      ]);
    } else if (key.startsWith('budget-')) {
      this.receiveBotMessage('Step 3: Room type?', [
        { key: 'room-shared', label: 'Shared' },
        { key: 'room-private', label: 'Private' }
      ]);
    } else if (key.startsWith('room-')) {
      // Emit demo room cards
      this.emitCard({ title: 'Sunny Shared Room', price: 950, distanceKm: 0.8, listingId: 'demo1', photoUrl: '/assets/placeholder-room.jpg' }, 'room-card');
      this.emitCard({ title: 'Private Studio', price: 1800, distanceKm: 2.1, listingId: 'demo2', photoUrl: '/assets/placeholder-room.jpg' }, 'room-card');
      this.receiveBotMessage('Want to refine more?', [
        { key: 'housing-restart', label: 'Restart flow' }
      ]);
    } else if (key === 'housing-restart') {
      this.startHousingStepper();
    }
  }

  private genId() { return Math.random().toString(36).slice(2); }

  // Threads persistence + migration from single-history store
  newThread(title: string = 'New chat') {
    const id = this.genId();
    const now = Date.now();
    const thread = { id, title, createdAt: now, updatedAt: now, messages: [] as AssistantMessage[] };
    this._threads.set([thread, ...this._threads()]);
    this._currentThreadId.set(id);
    this._messages.set([]);
    this.saveThreads();
  }
  switchThread(id: string) {
    const t = this._threads().find(x => x.id === id);
    if (!t) return;
    this._currentThreadId.set(id);
    this._messages.set(t.messages || []);
    this.saveThreads();
  }
  renameThread(id: string, title: string) {
    this._threads.set(this._threads().map(t => t.id === id ? { ...t, title } : t));
    this.saveThreads();
  }
  private autoTitleCurrentThread(userText: string) {
    const tid = this._currentThreadId();
    if (!tid) return;
    const t = this._threads().find(x => x.id === tid);
    if (!t) return;
    if (t.title === 'New chat' || /^New chat/.test(t.title)) {
      const title = userText.split(/\s+/).slice(0, 5).join(' ');
      if (title.length > 0) this.renameThread(tid, title);
    }
  }
  private saveThreads(){
    try {
      localStorage.setItem(this.threadsKey, JSON.stringify(this._threads()));
      localStorage.setItem(this.threadsCurrentKey, this._currentThreadId());
    } catch {}
  }
  private restoreThreads(){
    // Try threads first
    try {
      const raw = localStorage.getItem(this.threadsKey);
      const cur = localStorage.getItem(this.threadsCurrentKey) || '';
      if (raw) {
        const list = JSON.parse(raw) as Array<{ id: string; title: string; createdAt: number; updatedAt: number; messages: AssistantMessage[] }>;
        this._threads.set(list);
        // pick current thread
        const found = list.find(t => t.id === cur) || list[0];
        if (found) { this._currentThreadId.set(found.id); this._messages.set(found.messages || []); }
        return;
      }
    } catch {}
    // Migrate from single history if present
    try {
      const rawOld = localStorage.getItem(this.storageKey);
      if (rawOld) {
        const list: AssistantMessage[] = JSON.parse(rawOld);
        const id = this.genId();
        const now = Date.now();
        this._threads.set([{ id, title: 'Previous chat', createdAt: now, updatedAt: now, messages: list }]);
        this._currentThreadId.set(id);
        this._messages.set(list);
        this.saveThreads();
        return;
      }
    } catch {}
    // Otherwise create a fresh thread
    this.newThread();
  }

  sendFeedback(messageId: string, sentiment: 'up' | 'down') {
    this.analytics.fire('assistant_card_interaction', { type: 'feedback_' + sentiment, id: messageId });
    const updated = this._messages().map(m => m.id === messageId ? { ...m, content: (m.content || '') + `\n\n(Thanks for the feedback ${sentiment === 'up' ? '👍' : '👎'})` } : m);
    this._messages.set(updated);
    this.saveThreads();
  }
}
