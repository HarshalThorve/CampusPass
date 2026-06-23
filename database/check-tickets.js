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

async function checkTickets() {
  const client = await pool.connect();
  try {
    console.log('--- USERS ---');
    const users = await client.query('SELECT id, name, email, role FROM users');
    console.table(users.rows);

    console.log('\n--- EVENTS ---');
    const events = await client.query('SELECT id, title, category, price, venue FROM events');
    console.table(events.rows);

    console.log('\n--- REGISTRATIONS ---');
    const regs = await client.query('SELECT id, user_id, event_id, payment_status, attendance_status FROM registrations');
    console.table(regs.rows);

    console.log('\n--- TICKETS ---');
    const tickets = await client.query('SELECT id, registration_id, ticket_number, qr_code FROM tickets');
    console.table(tickets.rows);

    console.log('\n--- ATTENDANCE ---');
    const attendance = await client.query('SELECT id, ticket_id, checkin_time FROM attendance');
    console.table(attendance.rows);
  } catch (err) {
    console.error('Error checking tickets:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

checkTickets();
