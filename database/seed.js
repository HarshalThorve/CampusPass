const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
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

async function runSeed() {
  console.log('Connecting to PostgreSQL database...');
  const client = await pool.connect();
  try {
    console.log('Reading schema.sql...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

    console.log('Executing schema...');
    await client.query(schemaSql);
    console.log('Schema executed successfully.');

    console.log('Seeding users...');
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const studentPassword = await bcrypt.hash('student123', salt);
    const student2Password = await bcrypt.hash('student123', salt);

    // Seed Users
    const usersResult = await client.query(`
      INSERT INTO users (name, email, password, role) VALUES
      ('Admin User', 'admin@campuspass.com', $1, 'admin'),
      ('Rahul Sharma', 'rahul@campuspass.com', $2, 'student'),
      ('Priya Patel', 'priya@campuspass.com', $3, 'student')
      RETURNING id, email, role
    `, [adminPassword, studentPassword, student2Password]);

    const admin = usersResult.rows.find(u => u.role === 'admin');
    const student1 = usersResult.rows.find(u => u.email === 'rahul@campuspass.com');
    const student2 = usersResult.rows.find(u => u.email === 'priya@campuspass.com');

    console.log(`Users seeded. Admin ID: ${admin.id}, Student 1 ID: ${student1.id}, Student 2 ID: ${student2.id}`);

    console.log('Seeding events...');
    // Seed Events
    // Categories: 'technical', 'cultural', 'sports', 'academic'
    const now = new Date();
    const formatSqlDate = (date) => date.toISOString().slice(0, 19).replace('T', ' ');

    const event1Date = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000); // 10 days later
    const event1Deadline = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000);

    const event2Date = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000); // 15 days later
    const event2Deadline = new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000);

    const event3Date = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 days later
    const event3Deadline = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);

    const event4Date = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days ago (Past Event)
    const event4Deadline = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);

    const event5Date = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000); // 5 days ago (Past Event)
    const event5Deadline = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const eventsResult = await client.query(`
      INSERT INTO events (title, description, date, venue, category, price, capacity, image, registration_deadline) VALUES
      ('HackSummit 2026', 'The ultimate 36-hour hackathon where students build innovative solutions for real-world problems. Exciting prizes, networking, and mentorship await.', $1, 'APJ Abdul Kalam Auditorium', 'technical', 299.00, 150, 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80', $2),
      ('Rhythm Cultural Fest', 'Celebrate art, music, dance, and drama. Join us for a star-studded evening filled with performances, food stalls, and cultural exhibits.', $3, 'Main Campus Lawn', 'cultural', 199.00, 500, 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80', $4),
      ('Inter-College Sports Meet', 'Compete in cricket, football, basketball, and athletics. Represent your college, show your sportsmanship, and win the championship trophy.', $5, 'Campus Sports Arena', 'sports', 0.00, 200, 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80', $6),
      ('AI Frontier: Guest Lecture', 'Distinguished industry experts discuss the future of AI, large language models, agentic systems, and careers in machine learning.', $7, 'Seminar Hall 3', 'academic', 0.00, 100, 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80', $8),
      ('ByteCode Coding Contest', 'An intensive 3-hour competitive programming contest. Solve algorithmic challenges, top the leaderboard, and win tech goodies.', $9, 'System Lab-2', 'technical', 49.00, 80, 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80', $10)
      RETURNING id, title, price
    `, [
      formatSqlDate(event1Date), formatSqlDate(event1Deadline),
      formatSqlDate(event2Date), formatSqlDate(event2Deadline),
      formatSqlDate(event3Date), formatSqlDate(event3Deadline),
      formatSqlDate(event4Date), formatSqlDate(event4Deadline),
      formatSqlDate(event5Date), formatSqlDate(event5Deadline)
    ]);

    const events = eventsResult.rows;
    const hackathon = events.find(e => e.title.includes('HackSummit'));
    const rhythm = events.find(e => e.title.includes('Rhythm'));
    const sports = events.find(e => e.title.includes('Sports'));
    const lecture = events.find(e => e.title.includes('AI Frontier'));
    const bytecode = events.find(e => e.title.includes('ByteCode'));

    console.log('Events seeded.');

    console.log('Seeding registrations and payments...');
    // Seed Student 1 registrations
    // Registered for HackSummit (Paid & Completed)
    const reg1 = await client.query(`
      INSERT INTO registrations (user_id, event_id, payment_status, attendance_status, created_at)
      VALUES ($1, $2, 'completed', 'absent', $3) RETURNING id
    `, [student1.id, hackathon.id, formatSqlDate(new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000))]);

    await client.query(`
      INSERT INTO payments (user_id, event_id, razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, status, created_at)
      VALUES ($1, $2, 'order_mock111', 'pay_mock111', 'sig_mock111', $3, 'successful', $4)
    `, [student1.id, hackathon.id, hackathon.price, formatSqlDate(new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000))]);

    await client.query(`
      INSERT INTO tickets (registration_id, ticket_number, qr_code)
      VALUES ($1, 'CP-HACK-SHARMA-001', $2)
    `, [reg1.rows[0].id, `CP-HACK-SHARMA-001`]);

    // Registered for Inter-College Sports (Free)
    const reg2 = await client.query(`
      INSERT INTO registrations (user_id, event_id, payment_status, attendance_status, created_at)
      VALUES ($1, $2, 'completed', 'absent', $3) RETURNING id
    `, [student1.id, sports.id, formatSqlDate(new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000))]);

    await client.query(`
      INSERT INTO tickets (registration_id, ticket_number, qr_code)
      VALUES ($1, 'CP-SPOR-SHARMA-002', $2)
    `, [reg2.rows[0].id, `CP-SPOR-SHARMA-002`]);

    // Registered for Past Guest Lecture (Free & Attended)
    const reg3 = await client.query(`
      INSERT INTO registrations (user_id, event_id, payment_status, attendance_status, created_at)
      VALUES ($1, $2, 'completed', 'present', $3) RETURNING id
    `, [student1.id, lecture.id, formatSqlDate(new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000))]);

    const ticket3 = await client.query(`
      INSERT INTO tickets (registration_id, ticket_number, qr_code)
      VALUES ($1, 'CP-LECT-SHARMA-003', $2) RETURNING id
    `, [reg3.rows[0].id, `CP-LECT-SHARMA-003`]);

    await client.query(`
      INSERT INTO attendance (ticket_id, checkin_time)
      VALUES ($1, $2)
    `, [ticket3.rows[0].id, formatSqlDate(new Date(event4Date.getTime() + 10 * 60 * 1000))]); // Checked in 10 mins after event started

    // Seed Student 2 registrations
    // Registered for Rhythm (Paid & Completed)
    const reg4 = await client.query(`
      INSERT INTO registrations (user_id, event_id, payment_status, attendance_status, created_at)
      VALUES ($1, $2, 'completed', 'absent', $3) RETURNING id
    `, [student2.id, rhythm.id, formatSqlDate(new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000))]);

    await client.query(`
      INSERT INTO payments (user_id, event_id, razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, status, created_at)
      VALUES ($1, $2, 'order_mock222', 'pay_mock222', 'sig_mock222', $3, 'successful', $4)
    `, [student2.id, rhythm.id, rhythm.price, formatSqlDate(new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000))]);

    await client.query(`
      INSERT INTO tickets (registration_id, ticket_number, qr_code)
      VALUES ($1, 'CP-RHYT-PATEL-001', $2)
    `, [reg4.rows[0].id, `CP-RHYT-PATEL-001`]);

    // Registered for Past ByteCode (Paid & Attended)
    const reg5 = await client.query(`
      INSERT INTO registrations (user_id, event_id, payment_status, attendance_status, created_at)
      VALUES ($1, $2, 'completed', 'present', $3) RETURNING id
    `, [student2.id, bytecode.id, formatSqlDate(new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000))]);

    await client.query(`
      INSERT INTO payments (user_id, event_id, razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, status, created_at)
      VALUES ($1, $2, 'order_mock333', 'pay_mock333', 'sig_mock333', $3, 'successful', $4)
    `, [student2.id, bytecode.id, bytecode.price, formatSqlDate(new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000))]);

    const ticket5 = await client.query(`
      INSERT INTO tickets (registration_id, ticket_number, qr_code)
      VALUES ($1, 'CP-BYTE-PATEL-002', $2) RETURNING id
    `, [reg5.rows[0].id, `CP-BYTE-PATEL-002`]);

    await client.query(`
      INSERT INTO attendance (ticket_id, checkin_time)
      VALUES ($1, $2)
    `, [ticket5.rows[0].id, formatSqlDate(new Date(event5Date.getTime() + 15 * 60 * 1000))]);

    console.log('Registrations, payments, tickets, and attendance history seeded.');
    console.log('Database seeding completed successfully!');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

runSeed();
