const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;
const DATABASE_AUTH_TOKEN = process.env.DATABASE_AUTH_TOKEN;

if (!DATABASE_URL || !DATABASE_AUTH_TOKEN) {
  console.error('❌ DATABASE_URL and DATABASE_AUTH_TOKEN must be set');
  process.exit(1);
}

async function runMigrations() {
  console.log('🔄 Connecting to Turso database...');
  
  const client = createClient({
    url: DATABASE_URL,
    authToken: DATABASE_AUTH_TOKEN,
  });

  try {
    console.log('🔄 Running database migrations...');

    // Read and execute migration files in order
    const migration1 = fs.readFileSync(
      path.join(__dirname, '../src/lib/db/migrations/0000_black_spacker_dave.sql'),
      'utf8'
    );
    
    const migration2 = fs.readFileSync(
      path.join(__dirname, '../src/lib/db/migrations/0001_whole_silver_surfer.sql'),
      'utf8'
    );

    // Split migrations by statement separator and execute
    const statements1 = migration1.split('--> statement-breakpoint').filter(s => s.trim());
    const statements2 = migration2.split('--> statement-breakpoint').filter(s => s.trim());

    console.log('🔄 Executing migration 0000_black_spacker_dave...');
    for (const statement of statements1) {
      if (statement.trim()) {
        await client.execute(statement.trim());
      }
    }

    console.log('🔄 Executing migration 0001_whole_silver_surfer...');
    for (const statement of statements2) {
      if (statement.trim()) {
        await client.execute(statement.trim());
      }
    }

    console.log('✅ Database migrations completed successfully!');
    console.log('✅ Tables created:');
    console.log('   - users');
    console.log('   - agents');
    console.log('   - deployments');
    console.log('   - deployment_logs');
    console.log('   - agent_reviews');
    console.log('   - accounts');
    console.log('   - sessions');
    console.log('   - verification_tokens');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    client.close();
  }
}

runMigrations(); 