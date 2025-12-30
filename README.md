# AI Support Agent - TechStyle Chat

A mini AI support agent for a live chat widget, built for the Spur Full-Stack Engineer take-home assignment.

## Live Demo

**Deployed URL:** https://ai-support-agent.netlify.app/

## Tech Stack

- **Backend:** Node.js + TypeScript + Express
- **Frontend:** SvelteKit (Svelte 5)
- **Database:** SQLite (via sql.js - pure JavaScript implementation)
- **LLM:** OpenAI GPT-3.5-turbo
- **Validation:** Zod

---

## How to Run Locally (Step by Step)

### Prerequisites

- Node.js 18+ (tested on Node.js 22+)
- npm or yarn
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Step 1: Clone the Repository

```bash
git clone https://github.com/Muskan244/AI-Support-Agent.git
cd AI-Support-Agent
```

### Step 2: Set Up the Backend

```bash
cd backend

# Install dependencies
npm install

# Create environment file from template
cp .env.example .env
```

### Step 3: Configure Environment Variables

Edit the `.env` file and add your OpenAI API key:

```bash
# Required - Your OpenAI API key
OPENAI_API_KEY=sk-your-api-key-here

# Optional - Server configuration
PORT=3000
NODE_ENV=development

# Optional - Database configuration
DATABASE_PATH=./data/chat.db

# Optional - LLM configuration
MAX_TOKENS=500
MAX_CONVERSATION_HISTORY=20
```

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes | - |
| `PORT` | Server port | No | `3000` |
| `NODE_ENV` | Environment mode | No | `development` |
| `DATABASE_PATH` | SQLite database file path | No | `./data/chat.db` |
| `MAX_TOKENS` | Max tokens for LLM response | No | `500` |
| `MAX_CONVERSATION_HISTORY` | Messages to include in context | No | `20` |

### Step 4: Set Up the Database (Migrations)

```bash
# Run database migrations to create tables
npm run db:migrate
```

This creates the SQLite database with the following schema:
- `conversations` table - stores chat sessions
- `messages` table - stores all user and AI messages

### Step 5: Start the Backend Server

```bash
npm run dev
```

The backend will start at `http://localhost:3000`

### Step 6: Set Up the Frontend

Open a **new terminal** and run:

```bash
cd frontend

# Install dependencies
npm install

# Create .env file with: VITE_API_URL=http://your-backend-url

# Start the development server
npm run dev
```

The frontend will start at `http://localhost:5173`

### Step 7: Open the App

Visit `http://localhost:5173` in your browser and start chatting!

---

## Architecture Overview

### Project Structure

```
ai-support-agent/
├── backend/
│   └── src/
│       ├── index.ts              # Express app entry point, middleware setup
│       ├── routes/
│       │   ├── chat.ts           # Chat API endpoints (POST /chat/message, GET /chat/history)
│       │   └── health.ts         # Health check endpoint
│       ├── services/
│       │   ├── llm.ts            # OpenAI integration, generateReply()
│       │   └── knowledge.ts      # FAQ knowledge base, system prompt
│       ├── db/
│       │   ├── database.ts       # SQLite operations (CRUD for conversations/messages)
│       │   └── migrate.ts        # Database schema migrations
│       ├── middleware/
│       │   ├── validation.ts     # Zod request validation, input sanitization
│       │   └── errorHandler.ts   # Global error handling, custom error classes
│       └── types/
│           └── index.ts          # TypeScript interfaces
│
├── frontend/
│   └── src/
│       ├── routes/
│       │   └── +page.svelte      # Main chat page
│       └── lib/
│           ├── api.ts            # API client for backend communication
│           ├── store.ts          # Svelte stores (messages, session, loading state)
│           ├── types.ts          # TypeScript interfaces
│           └── components/
│               ├── ChatWidget.svelte      # Main chat container
│               ├── ChatMessage.svelte     # Individual message display
│               ├── ChatInput.svelte       # Message input with validation
│               └── TypingIndicator.svelte # "Agent is typing..." animation
```

### Backend Layers

The backend follows a **layered architecture** for separation of concerns:

1. **Routes Layer** (`/routes`) - HTTP endpoint handlers, request/response handling
2. **Services Layer** (`/services`) - Business logic, LLM integration, knowledge management
3. **Data Layer** (`/db`) - Database operations, persistence
4. **Middleware Layer** (`/middleware`) - Cross-cutting concerns (validation, error handling)
5. **Types Layer** (`/types`) - TypeScript interfaces shared across layers

### Design Decisions

1. **Monorepo Structure**
   - Backend and frontend in the same repository for simplicity
   - Clear separation with independent package.json files
   - Easy to deploy separately or together

2. **SQLite with sql.js**
   - Pure JavaScript SQLite implementation
   - Zero configuration, works out of the box on any OS
   - Easy to swap for PostgreSQL in production

3. **Session Management**
   - UUID-based session IDs for conversation tracking
   - Session stored in browser localStorage for persistence across page reloads
   - No authentication required

4. **Service Layer Pattern**
   - LLM calls wrapped in `llm.ts` service with `generateReply(history, userMessage)`
   - Makes it easy to swap providers (OpenAI → Claude) by changing one file
   - Centralized error handling for API failures

5. **Knowledge Base Injection**
   - FAQ and store policies defined in `knowledge.ts`
   - Injected into the system prompt for every request
   - Could be moved to database for dynamic updates in production

6. **Three-Tier Error Handling**
   - Validation errors (Zod) → 400 with field-level details
   - Service errors (LLMError) → User-friendly messages
   - Unexpected errors → Generic message, logged for debugging

---

## LLM Notes

### Provider

- **OpenAI** with `gpt-3.5-turbo` model
- Chosen for reliability, speed, and cost-effectiveness
- Model can be changed by modifying `MODEL` constant in `backend/src/services/llm.ts`

### Prompting Strategy

The system prompt establishes the AI persona and injects domain knowledge:

```
You are a helpful and friendly customer support agent for TechStyle,
a trendy online fashion store. Your role is to assist customers with
their questions about orders, shipping, returns, products, and general
inquiries.

[FAQ KNOWLEDGE BASE]
- Shipping policies (free over $50, 3-5 business days, international available)
- Return policy (30 days, original condition, free returns)
- Support hours (Mon-Fri 9AM-6PM PST)
- Payment methods (Visa, Mastercard, PayPal, Apple Pay, etc.)
- Loyalty program details

[BEHAVIOR GUIDELINES]
- Be concise but thorough
- If you don't know something, say so honestly
- Don't make up information not in the knowledge base
```

### Conversation History

- Last 20 messages included in context for continuity
- Messages formatted as alternating user/assistant roles
- Configurable via `MAX_CONVERSATION_HISTORY` env var

### Cost Control Measures

| Control | Value | Purpose |
|---------|-------|---------|
| `MAX_TOKENS` | 500 | Limits response length |
| `MAX_CONVERSATION_HISTORY` | 20 | Limits context window size |
| Model | gpt-3.5-turbo | ~10x cheaper than GPT-4 |
| `temperature` | 0.7 | Balanced creativity/consistency |
| `frequency_penalty` | 0.3 | Reduces repetition |

---

## Trade-offs & "If I Had More Time..."

### Current Trade-offs

| Decision | Trade-off | Reasoning |
|----------|-----------|-----------|
| SQLite | Not suitable for high concurrency | Simple setup, easy to swap for PostgreSQL |
| Hardcoded FAQ | Requires code change to update | Faster to implement, could move to DB |
| No auth | Anyone can chat | Per assignment spec, keeps it simple |
| No streaming | User waits for full response | Simpler implementation, could add later |
| No caching | Every request hits OpenAI | Simpler, but higher latency/cost |

### What I'd Add With More Time

1. **Streaming Responses**
   - Use OpenAI's streaming API to show responses as they generate
   - Much better UX for longer responses

2. **Redis Caching**
   - Cache frequent FAQ responses
   - Reduce API calls and latency significantly

3. **Rate Limiting**
   - Per-session rate limiting to prevent abuse
   - Important for production deployment

4. **Comprehensive Testing**
   - Unit tests for services and utilities
   - Integration tests for API endpoints

5. **WebSocket Support**
   - Real-time message delivery
   - Better than polling for production use

6. **Admin Panel**
   - UI to update FAQ content without code changes
   - Analytics dashboard for common questions

7. **Multi-language Support**
   - i18n for UI text
   - Multilingual FAQ responses

8. **Message Features**
    - Edit/delete messages
    - Message reactions
    - File/image uploads

### Known Limitations

- No authentication (by design for this assignment)
- SQLite not suitable for high-concurrency production use
- FAQ knowledge is hardcoded in source code
- No message editing or deletion
- No offline support

---

## API Endpoints

### POST /chat/message

Send a message and receive an AI response.

**Request:**
```json
{
  "message": "What's your return policy?",
  "sessionId": "optional-uuid"
}
```

**Response:**
```json
{
  "reply": "We offer a 30-day return window for all items...",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### GET /chat/history/:sessionId

Retrieve conversation history for a session.

**Response:**
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "messages": [
    {
      "id": "uuid",
      "conversationId": "uuid",
      "sender": "user",
      "text": "Hello",
      "timestamp": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "uuid",
      "conversationId": "uuid",
      "sender": "ai",
      "text": "Hi! Welcome to TechStyle support...",
      "timestamp": "2024-01-01T00:00:01.000Z"
    }
  ]
}
```

### POST /chat/new

Start a new conversation (clears session).

**Response:**
```json
{
  "sessionId": "new-uuid-here"
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "services": {
    "api": "healthy",
    "database": "healthy",
    "llm": "healthy"
  }
}
```

---

## Features

- Real-time chat with AI-powered responses
- Conversation persistence across page reloads
- Session-based chat history
- "Agent is typing..." indicator
- Input validation (empty messages, max 2000 characters)
- Graceful error handling with user-friendly messages
- Mobile-responsive design
- Markdown rendering for AI responses
- Auto-scroll to latest message

---

## Deployment

### Backend (Render)

1. Set environment variables (especially `OPENAI_API_KEY`)
2. Build command: `npm run build`
3. Start command: `npm start`

### Frontend (Netlify)

1. Set `VITE_API_URL` to your backend URL
2. Build command: `npm run build`
3. Publish directory: `build`
