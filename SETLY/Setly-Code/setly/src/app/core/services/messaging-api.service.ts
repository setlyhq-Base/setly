import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, map, throwError, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Message {
  messageId?: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  text: string;
  read?: boolean;
  createdAt?: Date;
  
  // Sender profile data (populated from backend)
  senderName?: string;
  senderPhoto?: string;
}

export interface Conversation {
  conversationId?: string;
  participants: string[]; // Array of user IDs
  listingId?: string;
  listingType?: 'room' | 'ride' | 'marketplace';
  listingTitle?: string;
  listingImage?: string;
  lastMessage?: Message;
  unreadCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
  
  // Other participant data (populated from backend)
  otherUserName?: string;
  otherUserPhoto?: string;
  otherUserVerified?: boolean;
}

export interface ConversationResponse {
  count: number;
  conversations: Conversation[];
}

export interface MessagesResponse {
  count: number;
  messages: Message[];
}

export interface CreateConversationRequest {
  otherUserId: string;
  listingId?: string;
  listingType?: 'room' | 'ride' | 'marketplace';
}

/**
 * Messaging Backend API Service
 * Connects to AWS Lambda /api/conversations and /api/messages endpoints
 * Provides real-time messaging functionality
 */
@Injectable({
  providedIn: 'root'
})
export class MessagingApiService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl || '/api';
  
  // Signal-based state for active conversations
  private _conversations = signal<Conversation[]>([]);
  conversations = this._conversations.asReadonly();
  
  private _unreadCount = signal<number>(0);
  unreadCount = this._unreadCount.asReadonly();

  /**
   * Get all conversations for current user
   */
  getConversations(): Observable<Conversation[]> {
    return this.http.get<ConversationResponse>(`${this.apiUrl}/conversations`).pipe(
      map(response => response.conversations),
      tap(conversations => {
        this._conversations.set(conversations);
        this._updateUnreadCount(conversations);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get conversation by ID
   */
  getConversation(conversationId: string): Observable<Conversation> {
    return this.http.get<Conversation>(`${this.apiUrl}/conversations/${conversationId}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Create new conversation
   */
  createConversation(request: CreateConversationRequest): Observable<Conversation> {
    return this.http.post<Conversation>(`${this.apiUrl}/conversations`, request).pipe(
      tap(conversation => {
        this._conversations.update(convs => [conversation, ...convs]);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get messages for a conversation
   */
  getMessages(conversationId: string, limit = 50, offset = 0): Observable<Message[]> {
    const params = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString());

    return this.http.get<MessagesResponse>(
      `${this.apiUrl}/conversations/${conversationId}/messages`,
      { params }
    ).pipe(
      map(response => response.messages),
      catchError(this.handleError)
    );
  }

  /**
   * Send message in a conversation
   */
  sendMessage(conversationId: string, text: string): Observable<Message> {
    return this.http.post<Message>(
      `${this.apiUrl}/conversations/${conversationId}/messages`,
      { text }
    ).pipe(
      tap(() => {
        // Update conversation's lastMessage timestamp
        this._conversations.update(convs => 
          convs.map(c => 
            c.conversationId === conversationId 
              ? { ...c, updatedAt: new Date() }
              : c
          )
        );
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Mark message as read
   */
  markAsRead(messageId: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/messages/${messageId}/read`, {}).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Mark all messages in conversation as read
   */
  markConversationAsRead(conversationId: string): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/conversations/${conversationId}/read`,
      {}
    ).pipe(
      tap(() => {
        this._conversations.update(convs =>
          convs.map(c =>
            c.conversationId === conversationId
              ? { ...c, unreadCount: 0 }
              : c
          )
        );
        this._updateUnreadCount(this._conversations());
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Delete conversation
   */
  deleteConversation(conversationId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/conversations/${conversationId}`).pipe(
      tap(() => {
        this._conversations.update(convs =>
          convs.filter(c => c.conversationId !== conversationId)
        );
        this._updateUnreadCount(this._conversations());
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Poll for new messages (use when websockets not available)
   * Call this periodically to check for updates
   */
  pollConversations(): Observable<Conversation[]> {
    return this.getConversations();
  }

  /**
   * Update unread count from conversations
   */
  private _updateUnreadCount(conversations: Conversation[]): void {
    const total = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
    this._unreadCount.set(total);
  }

  /**
   * Refresh conversations (useful after sending/receiving messages)
   */
  refresh(): void {
    this.getConversations().subscribe();
  }

  private handleError(error: any): Observable<never> {
    console.error('Messaging API Error:', error);
    const errorMessage = error.error?.message || error.message || 'An error occurred with messaging API';
    return throwError(() => new Error(errorMessage));
  }
}
