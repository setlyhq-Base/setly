export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  sources?: Source[];
}

export interface Source {
  id: string;
  question: string;
  score: number;
}

export interface Thread {
  id: string;
  roomId: string;
  participantIds: string[];
  lastMessageAt: string;
  unreadFor?: string[];
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  text: string;
  sentAt: string;
}
