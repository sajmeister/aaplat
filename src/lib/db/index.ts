import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

const DATABASE_URL = process.env.DATABASE_URL || 'file:local.db';

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create the client - handles both local SQLite and Turso
const client = createClient({
  url: DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN, // Only needed for Turso
});

// Create the database instance
export const db = drizzle(client, { schema });

// Export the client for direct access if needed
export { client }; 