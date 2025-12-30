import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import path from 'path';
import fs from 'fs';
import type { Conversation, Message } from '../types/index.js';

let db: SqlJsDatabase | null = null;

const dataDir = process.env.DATABASE_PATH
  ? path.dirname(process.env.DATABASE_PATH)
  : './data';
const dbPath = process.env.DATABASE_PATH || './data/chat.db';

function saveDatabase(): void {
  if (!db) return;

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

export async function initializeDatabase(): Promise<void> {
  const SQL = await initSqlJs();

  if (fs.existsSync(dbPath)) {
    try {
      const fileBuffer = fs.readFileSync(dbPath);
      db = new SQL.Database(fileBuffer);
      console.log('Loaded existing database from', dbPath);
    } catch (error) {
      console.log('Could not load database, creating new one');
      db = new SQL.Database();
    }
  } else {
    db = new SQL.Database();
    console.log('Created new database');
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      metadata TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversationId TEXT NOT NULL,
      sender TEXT NOT NULL CHECK (sender IN ('user', 'ai')),
      text TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (conversationId) REFERENCES conversations(id)
    )
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_messages_conversation
    ON messages(conversationId)
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_messages_timestamp
    ON messages(timestamp)
  `);

  saveDatabase();
  console.log('Database initialized successfully');
}

function getDb(): SqlJsDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

export function createConversation(id: string): Conversation {
  const database = getDb();
  const now = new Date().toISOString();

  database.run(
    'INSERT INTO conversations (id, createdAt, updatedAt) VALUES (?, ?, ?)',
    [id, now, now]
  );
  saveDatabase();

  return { id, createdAt: now, updatedAt: now };
}

export function getConversation(id: string): Conversation | null {
  const database = getDb();
  const result = database.exec(
    'SELECT * FROM conversations WHERE id = ?',
    [id]
  );

  if (result.length === 0 || result[0].values.length === 0) {
    return null;
  }

  const row = result[0].values[0];
  return {
    id: row[0] as string,
    createdAt: row[1] as string,
    updatedAt: row[2] as string,
    metadata: row[3] as string | undefined,
  };
}

export function updateConversationTimestamp(id: string): void {
  const database = getDb();
  database.run(
    'UPDATE conversations SET updatedAt = ? WHERE id = ?',
    [new Date().toISOString(), id]
  );
  saveDatabase();
}

export function createMessage(
  id: string,
  conversationId: string,
  sender: 'user' | 'ai',
  text: string
): Message {
  const database = getDb();
  const timestamp = new Date().toISOString();

  database.run(
    'INSERT INTO messages (id, conversationId, sender, text, timestamp) VALUES (?, ?, ?, ?, ?)',
    [id, conversationId, sender, text, timestamp]
  );

  updateConversationTimestamp(conversationId);

  return { id, conversationId, sender, text, timestamp };
}

export function getMessagesByConversation(conversationId: string): Message[] {
  const database = getDb();
  const result = database.exec(
    'SELECT * FROM messages WHERE conversationId = ? ORDER BY timestamp ASC',
    [conversationId]
  );

  if (result.length === 0) {
    return [];
  }

  return result[0].values.map((row) => ({
    id: row[0] as string,
    conversationId: row[1] as string,
    sender: row[2] as 'user' | 'ai',
    text: row[3] as string,
    timestamp: row[4] as string,
  }));
}

export function getRecentMessages(
  conversationId: string,
  limit: number = 20
): Message[] {
  const database = getDb();
  const result = database.exec(
    'SELECT * FROM messages WHERE conversationId = ? ORDER BY timestamp DESC LIMIT ?',
    [conversationId, limit]
  );

  if (result.length === 0) {
    return [];
  }

  const messages = result[0].values.map((row) => ({
    id: row[0] as string,
    conversationId: row[1] as string,
    sender: row[2] as 'user' | 'ai',
    text: row[3] as string,
    timestamp: row[4] as string,
  }));

  return messages.reverse();
}

export function closeDatabase(): void {
  if (db) {
    saveDatabase();
    db.close();
    db = null;
  }
}

export default { initializeDatabase, closeDatabase };
