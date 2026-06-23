const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
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

async function createStudent() {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.log('Usage: node create-student.js "<name>" <email> <password>');
    console.log('Example: node create-student.js "Student User" student@campuspass.com student123');
    process.exit(1);
  }

  const [name, email, password] = args;

  console.log(`Connecting to database to create student: ${name} (${email})...`);
  const client = await pool.connect();

  try {
    // Check if user already exists
    const userExists = await client.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (userExists.rows.length > 0) {
      console.log('A user with this email already exists.');
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await client.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name.trim(), email.toLowerCase().trim(), passwordHash, 'student']
    );

    console.log(`Successfully created student user:`, result.rows[0]);
  } catch (err) {
    console.error('Failed to create student:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

createStudent();
