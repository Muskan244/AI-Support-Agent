import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  createConversation,
  getConversation,
  createMessage,
  getRecentMessages,
  getMessagesByConversation,
} from '../db/database.js';
import { generateReply, LLMError } from '../services/llm.js';
import { validateChatMessage, sanitizeMessage } from '../middleware/validation.js';
import { ApiError } from '../middleware/errorHandler.js';
import type { ChatResponse, ConversationHistory } from '../types/index.js';

const router = Router();

const MAX_HISTORY_MESSAGES = parseInt(process.env.MAX_CONVERSATION_HISTORY || '20', 10);

router.post('/message', validateChatMessage, async (req, res, next) => {
  try {
    const { message, sessionId } = req.body;

    const sanitizedMessage = sanitizeMessage(message);

    if (!sanitizedMessage) {
      throw new ApiError('Message cannot be empty after sanitization', 400, 'EMPTY_MESSAGE');
    }

    let conversationId = sessionId;

    if (sessionId) {
      const existingConversation = getConversation(sessionId);
      if (!existingConversation) {
        createConversation(sessionId);
      }
    } else {
      conversationId = uuidv4();
      createConversation(conversationId);
    }

    const history = getRecentMessages(conversationId!, MAX_HISTORY_MESSAGES);

    const userMessageId = uuidv4();
    createMessage(userMessageId, conversationId!, 'user', sanitizedMessage);

    let reply: string;
    try {
      reply = await generateReply(history, sanitizedMessage);
    } catch (error) {
      if (error instanceof LLMError) {
        // Save error message to indicate failed response
        const errorReply = "I apologize, but I'm having trouble processing your request right now. Please try again in a moment, or contact our support team at support@techstyle.com for immediate assistance.";
        const aiMessageId = uuidv4();
        createMessage(aiMessageId, conversationId!, 'ai', errorReply);

        throw error;
      }
      throw error;
    }

    const aiMessageId = uuidv4();
    createMessage(aiMessageId, conversationId!, 'ai', reply);

    const response: ChatResponse = {
      reply,
      sessionId: conversationId!,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

router.get('/history/:sessionId', async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(sessionId)) {
      throw new ApiError('Invalid session ID format', 400, 'INVALID_SESSION_ID');
    }

    const conversation = getConversation(sessionId);
    if (!conversation) {
      throw new ApiError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
    }

    const messages = getMessagesByConversation(sessionId);

    const response: ConversationHistory = {
      sessionId,
      messages,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

router.post('/new', async (req, res, next) => {
  try {
    const sessionId = uuidv4();
    createConversation(sessionId);

    res.json({
      sessionId,
      message: 'New conversation started',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
