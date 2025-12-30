export interface Conversation {
  id: string;
  createdAt: string;
  updatedAt: string;
  metadata?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
}

export interface ChatResponse {
  reply: string;
  sessionId: string;
}

export interface ConversationHistory {
  sessionId: string;
  messages: Message[];
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}
