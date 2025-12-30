import type { Request, Response, NextFunction } from 'express';
import { LLMError } from '../services/llm.js';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
    public readonly code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error(`[Error] ${error.name}: ${error.message}`);
  if (process.env.NODE_ENV === 'development') {
    console.error(error.stack);
  }

  if (error instanceof LLMError) {
    res.status(error.statusCode).json({
      error: 'AI Service Error',
      message: error.message,
      code: error.code,
    });
    return;
  }

  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      error: 'API Error',
      message: error.message,
      code: error.code,
    });
    return;
  }

  if (error instanceof SyntaxError && 'body' in error) {
    res.status(400).json({
      error: 'Bad Request',
      message: 'Invalid JSON in request body',
      code: 'INVALID_JSON',
    });
    return;
  }

  res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred. Please try again later.',
    code: 'INTERNAL_ERROR',
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    code: 'NOT_FOUND',
  });
}
