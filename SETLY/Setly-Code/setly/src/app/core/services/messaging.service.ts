import { Injectable, signal } from '@angular/core';
import { Thread, ChatMessage } from '../models/message.model';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private readonly THREADS_KEY = 'threads';
  private readonly MESSAGES_KEY = 'messages';

  threads = signal<Thread[]>([]);
  messagesByThread = signal<Record<string, ChatMessage[]>>({});

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    // Load threads
    const storedThreads = localStorage.getItem(this.THREADS_KEY);
    if (storedThreads) {
      this.threads.set(JSON.parse(storedThreads));
    }

    // Load messages
    const storedMessages = localStorage.getItem(this.MESSAGES_KEY);
    if (storedMessages) {
      this.messagesByThread.set(JSON.parse(storedMessages));
    }
  }

  private saveData(): void {
    localStorage.setItem(this.THREADS_KEY, JSON.stringify(this.threads()));
    localStorage.setItem(this.MESSAGES_KEY, JSON.stringify(this.messagesByThread()));
  }

  getThreadByRoomAndUser(roomId: string, userId: string): Thread | undefined {
    return this.threads().find(thread =>
      thread.roomId === roomId && thread.participantIds.includes(userId)
    );
  }

  createThread(roomId: string, participantIds: string[]): Thread {
    const thread: Thread = {
      id: `thread_${Date.now()}`,
      roomId,
      participantIds,
      lastMessageAt: new Date().toISOString(),
      unreadFor: participantIds
    };

    this.threads.update(threads => [...threads, thread]);
    this.saveData();
    return thread;
  }

  sendMessage(threadId: string, senderId: string, text: string): void {
    const message: ChatMessage = {
      id: `msg_${Date.now()}`,
      threadId,
      senderId,
      text,
      sentAt: new Date().toISOString()
    };

    this.messagesByThread.update(messages => ({
      ...messages,
      [threadId]: [...(messages[threadId] || []), message]
    }));

    // Update thread's last message time
    this.threads.update(threads =>
      threads.map(thread =>
        thread.id === threadId
          ? { ...thread, lastMessageAt: message.sentAt, unreadFor: thread.participantIds.filter(id => id !== senderId) }
          : thread
      )
    );

    this.saveData();
  }

  getMessagesForThread(threadId: string): ChatMessage[] {
    return this.messagesByThread()[threadId] || [];
  }

  markThreadAsRead(threadId: string, userId: string): void {
    this.threads.update(threads =>
      threads.map(thread =>
        thread.id === threadId
          ? { ...thread, unreadFor: thread.unreadFor?.filter(id => id !== userId) }
          : thread
      )
    );
    this.saveData();
  }
}
