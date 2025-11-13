import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, BehaviorSubject, map } from 'rxjs';
import { Message, Source, AssistantChip } from '../models/message.model';
import { FAQS } from '../../../assets/data/faqs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AssistantService {
  private rateLimitMap = new Map<string, { count: number; resetTime: number }>();
  private readonly RATE_LIMIT = 20;
  private readonly WINDOW_MS = 10 * 60 * 1000; // 10 minutes

  private messagesSubject = new BehaviorSubject<Message[]>([]);
  public messages$ = this.messagesSubject.asObservable();
  private welcomeSeeded = false;

  constructor(private http: HttpClient) {}

  // Gamification state
  private xp = 0;
  private level = 1;
  private readonly XP_PER_MESSAGE = 8;
  private readonly LEVEL_STEP = 60; // xp per level

  private loadGamify() {
    try {
      const raw = localStorage.getItem('assistantGamify');
      if (raw) {
        const data = JSON.parse(raw);
        this.xp = data.xp || 0;
        this.level = data.level || 1;
      }
    } catch {}
  }
  private saveGamify() {
    try { localStorage.setItem('assistantGamify', JSON.stringify({ xp: this.xp, level: this.level })); } catch {}
  }

  gamifyTick() {
    this.loadGamify();
    const prevLevel = this.level;
    this.xp += this.XP_PER_MESSAGE;
    this.level = Math.floor(this.xp / this.LEVEL_STEP) + 1;
    this.saveGamify();
    if (this.level > prevLevel) {
      // Inject a level-up system message
      const lvlMsg: Message = {
        id: 'levelup-' + Date.now(),
        role: 'system',
        timestamp: new Date(),
        content: `🎉 Level Up! You reached Level ${this.level}. Keep exploring for more tips.`
      };
      this.addMessage(lvlMsg);
    }
  }

  // Real OpenAI API call with post-transform & chips
  query(message: string, history: Message[] = []): Observable<{ response: string; sources: Source[]; chips: AssistantChip[] }> {
    // Rate limiting
    const clientId = 'default'; // In real app, use IP or user ID
    if (!this.checkRateLimit(clientId)) {
      return of({ response: 'Rate limit exceeded. Please try again later.', sources: [], chips: [{ key: 'start-over', label: 'Start over', icon: '🔄' }] });
    }

    // Find relevant FAQ sources
    const sources = this.mockSimilaritySearch(message);

    // Build system prompt with FAQ context
    const systemPrompt = this.buildSystemPrompt(sources);

    // Prepare messages for OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: message }
    ];

    // Call backend API
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const body = {
      messages: messages,
      max_tokens: 500,
      temperature: 0.7
    };

    // Analytics
    console.log('Assistant event: assistant_message_sent');
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({ event: 'assistant_message_sent' });
    }
    if (sources.length === 0 || (sources[0] && sources[0].score < 0.78)) {
      console.log('Assistant event: assistant_low_confidence');
      if (typeof window !== 'undefined' && (window as any).dataLayer) {
        (window as any).dataLayer.push({ event: 'assistant_low_confidence' });
      }
    }

    // Normalize API URL to the chat endpoint; allow providing either base /assistant or full /assistant/chat
    const base = (environment.assistant.apiUrl || '/api/assistant').trim();
    const url = base.endsWith('/chat') ? base : base.replace(/\/$/, '') + '/chat';

    return this.http.post<any>(url, body, { headers }).pipe(
      map(response => {
        let raw = response?.choices?.[0]?.message?.content
          || response?.message
          || 'Assistant unavailable right now. Please try again shortly.';
        const shortened = this.transformContent(raw, message);
        const chips = this.generateChips(message);
        return { response: shortened, sources, chips };
      })
    );
  }

  private checkRateLimit(clientId: string): boolean {
    const now = Date.now();
    const record = this.rateLimitMap.get(clientId);
    if (!record || now > record.resetTime) {
      this.rateLimitMap.set(clientId, { count: 1, resetTime: now + this.WINDOW_MS });
      return true;
    }
    if (record.count >= this.RATE_LIMIT) {
      return false;
    }
    record.count++;
    return true;
  }

  private mockSimilaritySearch(query: string): Source[] {
    const lowerQuery = query.toLowerCase();
    const matches = FAQS
      .map(faq => {
        const score = this.calculateSimilarity(lowerQuery, faq.question.toLowerCase() + ' ' + faq.tags.join(' ').toLowerCase());
        return { id: faq.id, question: faq.question, score };
      })
      .filter(match => match.score > 0.1)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
    return matches;
  }

  private calculateSimilarity(query: string, text: string): number {
    // Simple Jaccard similarity for MVP
    const queryWords = new Set(query.split(' '));
    const textWords = new Set(text.split(' '));
    const intersection = new Set([...queryWords].filter(x => textWords.has(x)));
    const union = new Set([...queryWords, ...textWords]);
    return intersection.size / union.size;
  }

  private buildSystemPrompt(sources: Source[]): string {
    const relevantFaqs = sources
      .filter(s => s.score > 0.5)
      .map(s => FAQS.find(f => f.id === s.id))
      .filter(f => f)
      .slice(0, 3);

    const faqContext = relevantFaqs.length > 0
      ? `\nRelevant knowledge:\n${relevantFaqs.map(f => `- ${f!.question}: ${f!.answer}`).join('\n')}`
      : '';

    return `You are Setly Assistant — a warm, concise relocation co-pilot for newcomers to the U.S.
Use the provided knowledge snippets when relevant. If unsure, say so and suggest next steps.
You are not a lawyer; do not give legal advice. For immigration/tax/medical, share general guidance plus a "not legal advice" note.
Style: bullet points, short steps, links only when useful (Uber deep link helper when ride requested).
Always prioritize Setly features: housing help, airport pickup deep links, essentials checklists.
When you use KB snippets, show "Sources" with the related question titles.

If confidence is low, say: "I'm not fully sure. Here's my best take + what to do next." Then suggest contacting support.

You can generate images for room listings when users ask for photos or images. Use DALL-E to create realistic, high-quality images of apartments, rooms, or housing interiors.${faqContext}`;
  }

  healthCheck(): Observable<{ ok: boolean }> {
    // Mock health check
    return of({ ok: true });
  }

  addMessage(message: Message) {
    const current = this.messagesSubject.value;
    this.messagesSubject.next([...current, message]);
  }

  clearMessages() {
    this.messagesSubject.next([]);
    this.welcomeSeeded = false;
  }

  seedWelcomeMessage() {
    if (this.welcomeSeeded) return;
    const welcome: Message = {
      id: 'welcome-' + Date.now(),
      role: 'assistant',
      timestamp: new Date(),
      content: `👋 Welcome to Setly! Quick start:
• Housing help
• Airport pickup
• Documents (SSN / bank / SIM)
• First week checklist

Type what you need or press a chip below. Earn XP as you explore!`
    };
    this.addMessage(welcome);
    this.welcomeSeeded = true;
  }

  private transformContent(raw: string, userInput: string): string {
    // Keep it short & bulletized: take first 3 sentences
    const sentences = raw
      .replace(/\n+/g, ' ')
      .split(/(?<=[\.\!\?])\s+/)
      .filter(s => s.trim().length > 0)
      .slice(0, 3);
    const bullets = sentences.map(s => '• ' + s.trim());
    // Domain emoji prefix
    const emoji = this.pickEmoji(userInput);
    this.loadGamify();
    const progress = `XP ${this.xp} | L${this.level}`;
    return `${emoji} ${bullets.join('\n')}\n${progress}`;
  }

  private pickEmoji(input: string): string {
    const lower = input.toLowerCase();
    if (/housing|room|rent|apartment/.test(lower)) return '🏠';
    if (/airport|pickup|flight|arrive/.test(lower)) return '✈️';
    if (/bank|account|card/.test(lower)) return '🏦';
    if (/sim|phone|mobile|plan/.test(lower)) return '📶';
    if (/ssn|document|paperwork|id/.test(lower)) return '🗂️';
    if (/ride|car|uber|lyft|transport/.test(lower)) return '🚗';
    return '🌟';
  }

  private generateChips(input: string): AssistantChip[] {
    const chips: AssistantChip[] = [];
    const lower = input.toLowerCase();
    const push = (key: string, label: string, icon?: string) => chips.push({ key, label, icon });
    if (/housing|room|rent|apartment/.test(lower)) {
      push('filters', 'Refine housing', '🏠');
      push('budget', 'Set budget', '💰');
    }
    if (/airport|pickup|flight|arrive/.test(lower)) {
      push('arrival-checklist', 'Arrival checklist', '🛬');
      push('ride-options', 'Ride options', '🚗');
    }
    if (/bank|account|card/.test(lower)) {
      push('bank-docs', 'Needed documents', '📄');
    }
    if (/sim|phone|mobile|plan/.test(lower)) {
      push('carrier-compare', 'Compare carriers', '📶');
    }
    if (/ssn|document|paperwork|id/.test(lower)) {
      push('ssn-steps', 'SSN steps', '🗂️');
    }
    if (chips.length === 0) {
      push('next-steps', 'Next steps', '➡️');
      push('resources', 'Resources', '📚');
    }
    push('start-over', 'Start over', '🔄');
    return chips;
  }
}
