import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';

const MAX_MESSAGE_LENGTH = 2000;
const MIN_MESSAGE_LENGTH = 1;

export const chatMessageSchema = z.object({
  message: z
    .string()
    .min(MIN_MESSAGE_LENGTH, 'Message cannot be empty')
    .max(MAX_MESSAGE_LENGTH, `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters`)
    .transform((val) => val.trim()),
  sessionId: z
    .string()
    .uuid('Invalid session ID format')
    .optional(),
});

export type ChatMessageInput = z.infer<typeof chatMessageSchema>;

export function validateChatMessage(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const result = chatMessageSchema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid request data',
        details: errors,
      });
      return;
    }

    req.body = result.data;
    next();
  } catch (error) {
    res.status(400).json({
      error: 'Validation Error',
      message: 'Failed to validate request data',
    });
  }
}

export function sanitizeMessage(message: string): string {
  let sanitized = message.trim();

  sanitized = sanitized.replace(/\0/g, '');

  sanitized = sanitized.replace(/\s{10,}/g, ' '.repeat(10));

  return sanitized;
}

export function isValidSessionId(sessionId: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(sessionId);
}
