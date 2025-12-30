import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { initializeDatabase } from './db/database.js';
import chatRouter from './routes/chat.js';
import healthRouter from './routes/health.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json({ limit: '10kb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

app.use('/health', healthRouter);
app.use('/chat', chatRouter);

app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'AI Support Agent API',
    version: '1.0.0',
    description: 'Backend API for TechStyle AI Live Chat Support',
    endpoints: {
      health: 'GET /health',
      chat: {
        sendMessage: 'POST /chat/message',
        getHistory: 'GET /chat/history/:sessionId',
        newConversation: 'POST /chat/new',
      },
    },
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   AI Support Agent API Server                              ║
║                                                            ║
║   Server running on: http://localhost:${PORT}                 ║
║   Environment: ${(process.env.NODE_ENV || 'development').padEnd(40)}║
║                                                            ║
║   Endpoints:                                               ║
║   - POST /chat/message  - Send a message                   ║
║   - GET  /chat/history/:id - Get conversation history      ║
║   - GET  /health        - Health check                     ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

startServer();

export default app;
