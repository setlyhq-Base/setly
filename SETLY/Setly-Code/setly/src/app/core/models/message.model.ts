export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  sources?: Source[];
  // Optional interactive chips to make replies game-like / engaging
  chips?: AssistantChip[];
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

export interface AssistantChip {
  key: string;
  label: string;
  icon?: string; // Optional emoji/icon prefix
}

export interface AssistantThread {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
}
