const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
  connectionString,
  ssl: connectionString && (connectionString.includes('supabase') || connectionString.includes('render') || process.env.DB_SSL === 'true')
    ? { rejectUnauthorized: false }
    : false
});

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('Running database migration: Adding certificate design columns to events table...');
    
    await client.query(`
      ALTER TABLE events 
      ADD COLUMN IF NOT EXISTS certificate_theme VARCHAR(50) DEFAULT 'cream',
      ADD COLUMN IF NOT EXISTS certificate_background_url VARCHAR(1000);
    `);
    
    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
