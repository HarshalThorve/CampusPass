const { Pool } = require('pg');
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

async function checkUsers() {
  console.log('Connecting to PostgreSQL database...');
  const client = await pool.connect();
  try {
    console.log('Database connected successfully.');
    
    // Count total users
    const countRes = await client.query('SELECT COUNT(*)::int as count FROM users');
    console.log(`Total users in database: ${countRes.rows[0].count}`);

    // Fetch all users
    const usersRes = await client.query('SELECT id, name, email, role, password, created_at FROM users ORDER BY id DESC');
    const allUsers = usersRes.rows;

    console.log('\n--- Checking for users with non-bcrypt passwords ---');
    const invalidPasswords = allUsers.filter(u => {
      return !u.password.startsWith('$2b$') && !u.password.startsWith('$2a$');
    });

    if (invalidPasswords.length > 0) {
      console.log(`Found ${invalidPasswords.length} users with plain text or invalid passwords:`);
      invalidPasswords.forEach(u => {
        console.log(`ID: ${u.id}, Name: ${u.name}, Email: ${u.email}, Role: ${u.role}, Password: "${u.password}"`);
      });
    } else {
      console.log('All users in the database have valid bcrypt password hashes.');
    }

    console.log('\n--- Checking for users created manually (not in seed list) ---');
    const manualUsers = allUsers.filter(u => {
      // Seed list has emails like studentX@campuspass.com, admin@campuspass.com, rahul@campuspass.com, ananya@campuspass.com, etc.
      const isSeededEmail = u.email.endsWith('@campuspass.com');
      return !isSeededEmail;
    });

    if (manualUsers.length > 0) {
      console.log(`Found ${manualUsers.length} manual users:`);
      manualUsers.forEach(u => {
        console.log(`ID: ${u.id}, Name: ${u.name}, Email: ${u.email}, Role: ${u.role}, CreatedAt: ${u.created_at}`);
      });
    } else {
      console.log('No manual/custom users found in the database. All user emails end in @campuspass.com.');
    }

    console.log('\n--- Last 5 users in the database ---');
    allUsers.slice(0, 5).forEach(u => {
      console.log(`ID: ${u.id}, Name: ${u.name}, Email: ${u.email}, Role: ${u.role}`);
    });

  } catch (err) {
    console.error('Error running script:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

checkUsers();
