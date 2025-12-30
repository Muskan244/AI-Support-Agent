import dotenv from 'dotenv';
dotenv.config();

import { initializeDatabase, closeDatabase } from './database.js';

async function migrate() {
  console.log('Running database migrations...');
  await initializeDatabase();
  closeDatabase();
  console.log('Migrations complete!');
}

migrate();
