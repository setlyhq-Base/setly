import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, BehaviorSubject, map } from 'rxjs';
import { Message, Source } from '../models/message.model';
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

  constructor(private http: HttpClient) {}

  // Real OpenAI API call
  query(message: string, history: Message[] = []): Observable<{ response: string; sources: Source[] }> {
    // Rate limiting
    const clientId = 'default'; // In real app, use IP or user ID
    if (!this.checkRateLimit(clientId)) {
      return of({ response: 'Rate limit exceeded. Please try again later.', sources: [] });
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

    return this.http.post<any>(environment.assistant.apiUrl, body, { headers }).pipe(
      map(response => ({
        response: response.choices[0].message.content,
        sources: sources
      }))
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
  }
}
