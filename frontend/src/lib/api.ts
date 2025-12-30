import type { ChatResponse, ConversationHistory, ApiError } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      const error = data as ApiError;
      throw new Error(error.message || 'An error occurred');
    }

    return data as T;
  }

  async sendMessage(message: string, sessionId?: string): Promise<ChatResponse> {
    return this.request<ChatResponse>('/chat/message', {
      method: 'POST',
      body: JSON.stringify({ message, sessionId }),
    });
  }

  async getHistory(sessionId: string): Promise<ConversationHistory> {
    return this.request<ConversationHistory>(`/chat/history/${sessionId}`);
  }

  async startNewConversation(): Promise<{ sessionId: string }> {
    return this.request<{ sessionId: string }>('/chat/new', {
      method: 'POST',
    });
  }

  async checkHealth(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/health');
  }
}

export const api = new ApiClient(API_BASE_URL);
