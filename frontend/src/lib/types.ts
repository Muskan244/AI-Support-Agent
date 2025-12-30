export interface Message {
  id: string;
  conversationId: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface ChatResponse {
  reply: string;
  sessionId: string;
}

export interface ConversationHistory {
  sessionId: string;
  messages: Message[];
}

export interface ApiError {
  error: string;
  message: string;
  code?: string;
  details?: Array<{ field: string; message: string }>;
}
