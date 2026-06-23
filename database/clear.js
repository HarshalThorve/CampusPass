const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is not set in backend/.env');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: connectionString && (connectionString.includes('supabase') || connectionString.includes('render') || process.env.DB_SSL === 'true')
    ? { rejectUnauthorized: false }
    : false
});

async function clearDatabase() {
  console.log('Connecting to PostgreSQL database to clear all data...');
  const client = await pool.connect();
  try {
    console.log('Reading schema.sql...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

    console.log('Executing schema to recreate empty tables...');
    await client.query(schemaSql);
    console.log('Schema executed successfully. All tables dropped and recreated empty.');
  } catch (err) {
    console.error('Error clearing database:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

clearDatabase();
