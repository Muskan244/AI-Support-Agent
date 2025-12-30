import OpenAI from 'openai';
import type { Message, LLMMessage } from '../types/index.js';
import { SYSTEM_PROMPT } from './knowledge.js';

let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

const MODEL = 'gpt-3.5-turbo';
const MAX_TOKENS = parseInt(process.env.MAX_TOKENS || '500', 10);

export class LLMError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500
  ) {
    super(message);
    this.name = 'LLMError';
  }
}

function formatConversationHistory(messages: Message[]): LLMMessage[] {
  return messages.map((msg) => ({
    role: msg.sender === 'user' ? 'user' : 'assistant',
    content: msg.text,
  }));
}

export async function generateReply(
  history: Message[],
  userMessage: string
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new LLMError(
      'OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.',
      'MISSING_API_KEY',
      500
    );
  }

  const messages: LLMMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...formatConversationHistory(history),
    { role: 'user', content: userMessage },
  ];

  try {
    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: messages,
      max_tokens: MAX_TOKENS,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    });

    const reply = response.choices[0]?.message?.content;

    if (!reply) {
      throw new LLMError(
        'No response generated from the AI. Please try again.',
        'EMPTY_RESPONSE',
        500
      );
    }

    return reply.trim();
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      switch (error.status) {
        case 401:
          throw new LLMError(
            'Invalid API key. Please check your OpenAI API key configuration.',
            'INVALID_API_KEY',
            401
          );
        case 429:
          throw new LLMError(
            'Rate limit exceeded. Please wait a moment and try again.',
            'RATE_LIMIT',
            429
          );
        case 500:
        case 502:
        case 503:
          throw new LLMError(
            'OpenAI service is temporarily unavailable. Please try again later.',
            'SERVICE_UNAVAILABLE',
            503
          );
        default:
          throw new LLMError(
            `OpenAI API error: ${error.message}`,
            'API_ERROR',
            error.status || 500
          );
      }
    }

    if (error instanceof Error && error.message.includes('timeout')) {
      throw new LLMError(
        'Request timed out. Please try again.',
        'TIMEOUT',
        504
      );
    }

    if (error instanceof LLMError) {
      throw error;
    }
    throw new LLMError(
      'An unexpected error occurred while generating the response. Please try again.',
      'UNKNOWN_ERROR',
      500
    );
  }
}

export async function checkLLMHealth(): Promise<boolean> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return false;
    }

    const client = getOpenAIClient();
    await client.models.list();
    return true;
  } catch {
    return false;
  }
}
