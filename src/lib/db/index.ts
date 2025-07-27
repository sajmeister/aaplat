import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

// Handle different environments
const DATABASE_URL = process.env.DATABASE_URL || 'file:local.db';

// For production without local database, use in-memory SQLite
const getClientConfig = () => {
  if (process.env.NODE_ENV === 'production' && DATABASE_URL === 'file:local.db') {
    // Use in-memory database for production demo
    return {
      url: ':memory:',
    };
  }
  
  return {
    url: DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN, // Only needed for Turso
  };
};

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create the client - handles both local SQLite and Turso
const client = createClient(getClientConfig());

// Create the database instance
export const db = drizzle(client, { schema });

// Note: With Turso database, migrations should be run via 'npm run db:migrate-turso'
// The in-memory fallback is only for development without Turso credentials

// Export the client for direct access if needed
export { client }; 