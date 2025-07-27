import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { sql } from 'drizzle-orm';
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

// Auto-initialize schema for in-memory database in production
const isInMemoryProduction = process.env.NODE_ENV === 'production' && DATABASE_URL === 'file:local.db';

if (isInMemoryProduction) {
  console.log('🔧 Initializing in-memory database schema...');
  
  // Initialize schema on module load for in-memory database
  (async () => {
    try {
      // Create users table
      await db.run(sql`
        CREATE TABLE IF NOT EXISTS users (
          id text PRIMARY KEY NOT NULL,
          email text NOT NULL,
          name text,
          image text,
          email_verified integer,
          created_at integer DEFAULT (unixepoch()),
          updated_at integer DEFAULT (unixepoch())
        )
      `);
      
      await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users (email)`);

      // Create agents table
      await db.run(sql`
        CREATE TABLE IF NOT EXISTS agents (
          id text PRIMARY KEY NOT NULL,
          name text NOT NULL,
          description text,
          category text NOT NULL,
          runtime text NOT NULL,
          version text DEFAULT '1.0.0' NOT NULL,
          user_id text NOT NULL,
          docker_image text,
          source_code_url text,
          config_schema text,
          is_public integer DEFAULT false,
          downloads integer DEFAULT 0,
          rating real DEFAULT 0,
          created_at integer DEFAULT (unixepoch()),
          updated_at integer DEFAULT (unixepoch()),
          FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE no action ON DELETE no action
        )
      `);

      // Create deployments table
      await db.run(sql`
        CREATE TABLE IF NOT EXISTS deployments (
          id text PRIMARY KEY NOT NULL,
          name text NOT NULL,
          agent_id text NOT NULL,
          user_id text NOT NULL,
          status text DEFAULT 'pending' NOT NULL,
          railway_service_id text,
          url text,
          environment text,
          config text,
          created_at integer DEFAULT (unixepoch()),
          updated_at integer DEFAULT (unixepoch()),
          FOREIGN KEY (agent_id) REFERENCES agents(id) ON UPDATE no action ON DELETE no action,
          FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE no action ON DELETE no action
        )
      `);

      console.log('✅ In-memory database schema initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize in-memory database schema:', error);
    }
  })();
}

// Export the client for direct access if needed
export { client }; 