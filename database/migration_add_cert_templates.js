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
    console.log('Running database migration: Adding certificate template columns to events table...');
    
    await client.query(`
      ALTER TABLE events 
      ADD COLUMN IF NOT EXISTS certificate_institution VARCHAR(200) DEFAULT 'CampusPass Institute',
      ADD COLUMN IF NOT EXISTS certificate_signatory_name VARCHAR(200) DEFAULT 'Admin User',
      ADD COLUMN IF NOT EXISTS certificate_signatory_title VARCHAR(200) DEFAULT 'Event Coordinator',
      ADD COLUMN IF NOT EXISTS certificate_footer_text VARCHAR(500) DEFAULT 'This certificate is digitally verified by CampusPass.';
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
