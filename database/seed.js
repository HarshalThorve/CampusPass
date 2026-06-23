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

    // 1B. Seed main users (Admin and 10 students)
    const mainUsers = [
      { name: 'Admin User', email: 'admin@campuspass.com', password: adminPassword, role: 'admin' },
      { name: 'Rahul Sharma', email: 'rahul@campuspass.com', password: studentPassword, role: 'student' },
      { name: 'Ananya Iyer', email: 'ananya@campuspass.com', password: studentPassword, role: 'student' },
      { name: 'Vikram Malhotra', email: 'vikram@campuspass.com', password: studentPassword, role: 'student' },
      { name: 'Priya Patel', email: 'priya@campuspass.com', password: studentPassword, role: 'student' },
      { name: 'Arjun Desai', email: 'arjun@campuspass.com', password: studentPassword, role: 'student' },
      { name: 'Sneha Kulkarni', email: 'sneha@campuspass.com', password: studentPassword, role: 'student' },
      { name: 'Rohan Mehta', email: 'rohan@campuspass.com', password: studentPassword, role: 'student' },
      { name: 'Kavya Nair', email: 'kavya@campuspass.com', password: studentPassword, role: 'student' },
      { name: 'Dev Shah', email: 'dev@campuspass.com', password: studentPassword, role: 'student' },
      { name: 'Meera Joshi', email: 'meera@campuspass.com', password: studentPassword, role: 'student' }
    ];

    const insertedUsers = [];
    for (const u of mainUsers) {
      const res = await client.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
        [u.name, u.email, u.password, u.role]
      );
      insertedUsers.push(res.rows[0]);
    }

    const admin = insertedUsers.find(u => u.role === 'admin');
    const rahul = insertedUsers.find(u => u.email === 'rahul@campuspass.com');
    const ananya = insertedUsers.find(u => u.email === 'ananya@campuspass.com');
    const vikram = insertedUsers.find(u => u.email === 'vikram@campuspass.com');
    const priya = insertedUsers.find(u => u.email === 'priya@campuspass.com');
    const arjun = insertedUsers.find(u => u.email === 'arjun@campuspass.com');

    // Generate 290 more dummy student accounts for registration capacity counts
    console.log('Generating 290 dummy student accounts...');
    const dummyUsers = [];
    for (let i = 11; i <= 300; i++) {
      dummyUsers.push([`Dummy Student ${i}`, `student${i}@campuspass.com`, studentPassword, 'student']);
    }

    // Bulk insert dummy users
    let queryText = 'INSERT INTO users (name, email, password, role) VALUES ';
    const queryParams = [];
    dummyUsers.forEach((u, index) => {
      const baseIdx = index * 4;
      queryText += `($${baseIdx + 1}, $${baseIdx + 2}, $${baseIdx + 3}, $${baseIdx + 4})${index === dummyUsers.length - 1 ? '' : ','} `;
      queryParams.push(...u);
    });
    const dummyInsertRes = await client.query(queryText + ' RETURNING id, name, email, role', queryParams);
    const allStudents = insertedUsers.filter(u => u.role === 'student').concat(dummyInsertRes.rows);

    console.log(`Total seeded students: ${allStudents.length}`);

    console.log('Seeding events...');
    const now = new Date();
    const formatSqlDate = (date) => date.toISOString().slice(0, 19).replace('T', ' ');

    // Dates for core events
    const event1Date = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000); // HackSummit - 10 days later
    const event1Deadline = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000);

    const event2Date = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000); // Rhythm - 15 days later
    const event2Deadline = new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000);

    const event3Date = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // Inter-College Sports - 5 days later
    const event3Deadline = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);

    const event4Date = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // AI Frontier - 2 days ago (Past Event)
    const event4Deadline = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);

    const event5Date = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000); // ByteCode - 5 days ago (Past Event)
    const event5Deadline = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Insert 5 Core Events
    const eventsResult = await client.query(`
      INSERT INTO events (title, description, date, venue, category, price, capacity, image, registration_deadline, issues_certificate) VALUES
      ('HackSummit 2026', 'The ultimate 36-hour hackathon where students build innovative solutions for real-world problems. Exciting prizes, networking, and mentorship await.', $1, 'APJ Abdul Kalam Auditorium', 'technical', 299.00, 150, 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80', $2, true),
      ('Rhythm Cultural Fest', 'Celebrate art, music, dance, and drama. Join us for a star-studded evening filled with performances, food stalls, and cultural exhibits.', $3, 'Main Campus Lawn', 'cultural', 199.00, 500, 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80', $4, false),
      ('Inter-College Sports Meet', 'Compete in cricket, football, basketball, and athletics. Represent your college, show your sportsmanship, and win the championship trophy.', $5, 'Campus Sports Arena', 'sports', 0.00, 200, 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80', $6, true),
      ('AI Frontier: Guest Lecture', 'Distinguished industry experts discuss the future of AI, large language models, agentic systems, and careers in machine learning.', $7, 'Seminar Hall 3', 'academic', 0.00, 100, 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80', $8, true),
      ('ByteCode Coding Contest', 'An intensive 3-hour competitive programming contest. Solve algorithmic challenges, top the leaderboard, and win tech goodies.', $9, 'System Lab-2', 'technical', 49.00, 80, 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80', $10, true)
      RETURNING id, title, price, capacity
    `, [
      formatSqlDate(event1Date), formatSqlDate(event1Deadline),
      formatSqlDate(event2Date), formatSqlDate(event2Deadline),
      formatSqlDate(event3Date), formatSqlDate(event3Deadline),
      formatSqlDate(event4Date), formatSqlDate(event4Deadline),
      formatSqlDate(event5Date), formatSqlDate(event5Deadline)
    ]);

    const events = eventsResult.rows;
    const hackSummit = events.find(e => e.title.includes('HackSummit'));
    const rhythm = events.find(e => e.title.includes('Rhythm'));
    const sports = events.find(e => e.title.includes('Sports'));
    const aiLecture = events.find(e => e.title.includes('AI Frontier'));
    const byteCode = events.find(e => e.title.includes('ByteCode'));

    // 1E. Seed additional past events so we can have 9 check-ins for Ananya
    const pastEventsResult = await client.query(`
      INSERT INTO events (title, description, date, venue, category, price, capacity, image, registration_deadline, issues_certificate) VALUES
      ('WebDev Workshop 2026', 'Hands-on training on modern frontend technologies.', $1, 'System Lab-1', 'academic', 0.00, 100, 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80', $2, true),
      ('Design Sprint 2026', 'A fast-paced UI/UX design challenge.', $3, 'Seminar Hall 1', 'technical', 49.00, 80, 'https://images.unsplash.com/photo-1581291518655-9523c932dedf?auto=format&fit=crop&w=800&q=80', $4, true),
      ('Campus Debate Championship', 'Clash of ideas on contemporary global issues.', $5, 'Mini Auditorium', 'academic', 0.00, 50, 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80', $6, true),
      ('Cultural Night 2026', 'An evening of dance, music and drama performances.', $7, 'Main Auditorium', 'cultural', 199.00, 300, 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=800&q=80', $8, false),
      ('RoboSoccer Challenge', 'Design and program soccer-playing robots.', $9, 'System Lab-3', 'technical', 49.00, 120, 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80', $10, true),
      ('Resume Review Clinic', 'Get your resume reviewed by experts and alumni.', $11, 'Placement Cell', 'academic', 0.00, 60, 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80', $12, true)
      RETURNING id, title, price, capacity
    `, [
      formatSqlDate(new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000)), formatSqlDate(new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)),
      formatSqlDate(new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000)), formatSqlDate(new Date(now.getTime() - 17 * 24 * 60 * 60 * 1000)),
      formatSqlDate(new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000)), formatSqlDate(new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000)),
      formatSqlDate(new Date(now.getTime() - 22 * 24 * 60 * 60 * 1000)), formatSqlDate(new Date(now.getTime() - 24 * 24 * 60 * 60 * 1000)),
      formatSqlDate(new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000)), formatSqlDate(new Date(now.getTime() - 27 * 24 * 60 * 60 * 1000)),
      formatSqlDate(new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000)), formatSqlDate(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000))
    ]);

    const pastEvents = pastEventsResult.rows;
    const webdevWS = pastEvents.find(e => e.title.includes('WebDev'));
    const designSprint = pastEvents.find(e => e.title.includes('Design'));
    const debate = pastEvents.find(e => e.title.includes('Debate'));
    const cultNight = pastEvents.find(e => e.title.includes('Cultural'));
    const roboSoccer = pastEvents.find(e => e.title.includes('RoboSoccer'));
    const resumeClinic = pastEvents.find(e => e.title.includes('Resume'));

    // Combined all events array
    const allEvents = [...events, ...pastEvents];

    console.log('Events seeded. Starting registration & payment seeding...');

    // Function helper to insert a complete registration + payment + ticket
    const ticketCounter = {};
    const registerUser = async (user, event, createdAt, paymentStatus = 'completed', attendanceStatus = 'absent') => {
      const regRes = await client.query(`
        INSERT INTO registrations (user_id, event_id, payment_status, attendance_status, created_at)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id, event_id) DO UPDATE SET payment_status = EXCLUDED.payment_status, attendance_status = EXCLUDED.attendance_status
        RETURNING id
      `, [user.id, event.id, paymentStatus, attendanceStatus, formatSqlDate(createdAt)]);
      
      const regId = regRes.rows[0].id;

      if (event.price > 0 && paymentStatus === 'completed') {
        const orderId = `order_${Math.random().toString(36).substring(2, 11)}`;
        const payId = `pay_${Math.random().toString(36).substring(2, 11)}`;
        await client.query(`
          INSERT INTO payments (user_id, event_id, razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, status, created_at)
          VALUES ($1, $2, $3, $4, 'sig_mock_hash', $5, 'successful', $6)
        `, [user.id, event.id, orderId, payId, event.price, formatSqlDate(createdAt)]);
      }

      // Create a ticket
      if (paymentStatus === 'completed') {
        const eventPrefix = event.title.slice(0, 4).toUpperCase();
        const userLastName = user.name.split(' ').pop().toUpperCase();
        if (!ticketCounter[eventPrefix]) ticketCounter[eventPrefix] = 0;
        ticketCounter[eventPrefix]++;
        const numStr = String(ticketCounter[eventPrefix]).padStart(3, '0');
        const ticketNumber = `CP-${eventPrefix}-${userLastName}-${numStr}`;

        const tickRes = await client.query(`
          INSERT INTO tickets (registration_id, ticket_number, qr_code)
          VALUES ($1, $2, $3)
          ON CONFLICT (registration_id) DO UPDATE SET ticket_number = EXCLUDED.ticket_number
          RETURNING id
        `, [regId, ticketNumber, ticketNumber]);

        return { regId, ticketId: tickRes.rows[0].id };
      }
      return { regId, ticketId: null };
    };

    // ── 1C. REGISTRATIONS & PAYMENTS (Historical — for Revenue Chart) ──
    console.log('Generating historical revenue registrations...');

    const getRandDateInMonth = (year, month) => {
      const date = new Date(year, month, Math.floor(Math.random() * 28) + 1, Math.floor(Math.random() * 12) + 9);
      return date;
    };

    // March 2026: Target ~₹1,200 (10 paid registrations)
    // 3 Rhythm (3 * 199 = 597) + 1 HackSummit (299) + 6 ByteCode (6 * 49 = 294) = ₹1,190
    let userIndex = 15; // Start picking from dummy users for historical data to avoid conflicts
    for (let i = 0; i < 3; i++) {
      await registerUser(allStudents[userIndex++], rhythm, getRandDateInMonth(2026, 2), 'completed', 'absent');
    }
    await registerUser(allStudents[userIndex++], hackSummit, getRandDateInMonth(2026, 2), 'completed', 'absent');
    for (let i = 0; i < 6; i++) {
      await registerUser(allStudents[userIndex++], byteCode, getRandDateInMonth(2026, 2), 'completed', 'absent');
    }

    // April 2026: Target ~₹2,100 (15 paid registrations)
    // 4 Rhythm (4 * 199 = 796) + 3 HackSummit (3 * 299 = 897) + 8 ByteCode (8 * 49 = 392) = ₹2,085
    for (let i = 0; i < 4; i++) {
      await registerUser(allStudents[userIndex++], rhythm, getRandDateInMonth(2026, 3), 'completed', 'absent');
    }
    for (let i = 0; i < 3; i++) {
      await registerUser(allStudents[userIndex++], hackSummit, getRandDateInMonth(2026, 3), 'completed', 'absent');
    }
    for (let i = 0; i < 8; i++) {
      await registerUser(allStudents[userIndex++], byteCode, getRandDateInMonth(2026, 3), 'completed', 'absent');
    }

    // May 2026: Target ~₹3,400 (22 paid registrations)
    // 7 Rhythm (7 * 199 = 1393) + 5 HackSummit (5 * 299 = 1495) + 10 ByteCode (10 * 49 = 490) = ₹3,378
    for (let i = 0; i < 7; i++) {
      await registerUser(allStudents[userIndex++], rhythm, getRandDateInMonth(2026, 4), 'completed', 'absent');
    }
    for (let i = 0; i < 5; i++) {
      await registerUser(allStudents[userIndex++], hackSummit, getRandDateInMonth(2026, 4), 'completed', 'absent');
    }
    for (let i = 0; i < 10; i++) {
      await registerUser(allStudents[userIndex++], byteCode, getRandDateInMonth(2026, 4), 'completed', 'absent');
    }

    // June 2026: Target ~₹547 (existing current data)
    // - Rahul Sharma: HackSummit (₹299)
    // - Priya Patel: Rhythm (₹199) & ByteCode (₹49)
    const JuneRahulHackRes = await registerUser(rahul, hackSummit, new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), 'completed', 'absent');
    // Priya Patel's June payments
    const JunePriyaRhythRes = await registerUser(priya, rhythm, new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), 'completed', 'absent');
    const JunePriyaByteRes = await registerUser(priya, byteCode, new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000), 'completed', 'present');

    // Make sure Rahul's free registration for Inter-College Sports Meet exists
    await registerUser(rahul, sports, new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), 'completed', 'absent');

    // ── 1E & 1D. Attendance Check-ins (Heatmap & Leaderboard) ──
    console.log('Generating 38 attendance check-in records...');

    // Helper to find a specific weekday date in the past 30 days
    const getPastDateForWeekday = (targetWeekday, daysAgoStart, hour) => {
      const date = new Date(now.getTime());
      for (let i = daysAgoStart; i < daysAgoStart + 30; i++) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        if (d.getDay() === targetWeekday) {
          d.setHours(hour, Math.floor(Math.random() * 45) + 5, 0, 0);
          return d;
        }
      }
      return new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // Fallback
    };

    // User indexes for check-ins
    // userIdx maps: 0: Ananya, 1: Vikram, 2: Priya, 3: Arjun, 4: Rahul
    // userIdx >= 10: dummy users
    const checkinSpecs = [
      // Sunday (0)
      { weekday: 0, hour: 9, userIdx: 0, event: webdevWS }, // Ananya (Morning)
      { weekday: 0, hour: 12, userIdx: 1, event: webdevWS }, // Vikram (Midday)
      { weekday: 0, hour: 14, userIdx: 2, event: webdevWS }, // Priya (Afternoon)
      { weekday: 0, hour: 17, userIdx: 10, event: webdevWS }, // Dummy 10 (Evening)
      { weekday: 0, hour: 20, userIdx: 11, event: webdevWS }, // Dummy 11 (Night)
      
      // Monday (1)
      { weekday: 1, hour: 10, userIdx: 0, event: designSprint }, // Ananya (Morning)
      { weekday: 1, hour: 13, userIdx: 1, event: designSprint }, // Vikram (Afternoon)
      { weekday: 1, hour: 16, userIdx: 2, event: designSprint }, // Priya (Evening)
      { weekday: 1, hour: 18, userIdx: 12, event: designSprint }, // Dummy 12 (Evening)
      { weekday: 1, hour: 21, userIdx: 13, event: designSprint }, // Dummy 13 (Night)
      
      // Tuesday (2)
      { weekday: 2, hour: 9, userIdx: 0, event: debate }, // Ananya (Morning)
      { weekday: 2, hour: 10, userIdx: 1, event: debate }, // Vikram (Morning)
      { weekday: 2, hour: 11, userIdx: 2, event: debate }, // Priya (Midday)
      { weekday: 2, hour: 16, userIdx: 14, event: debate }, // Dummy 14 (Evening)
      { weekday: 2, hour: 20, userIdx: 15, event: debate }, // Dummy 15 (Night)
      
      // Wednesday (3)
      { weekday: 3, hour: 9, userIdx: 0, event: cultNight }, // Ananya (Morning)
      { weekday: 3, hour: 12, userIdx: 1, event: cultNight }, // Vikram (Midday)
      { weekday: 3, hour: 15, userIdx: 3, event: cultNight }, // Arjun (Afternoon)
      { weekday: 3, hour: 19, userIdx: 16, event: cultNight }, // Dummy 16 (Night)
      { weekday: 3, hour: 21, userIdx: 17, event: cultNight }, // Dummy 17 (Night)
      
      // Thursday (4)
      { weekday: 4, hour: 10, userIdx: 0, event: roboSoccer }, // Ananya (Morning)
      { weekday: 4, hour: 11, userIdx: 1, event: roboSoccer }, // Vikram (Midday)
      { weekday: 4, hour: 14, userIdx: 3, event: roboSoccer }, // Arjun (Afternoon)
      { weekday: 4, hour: 17, userIdx: 18, event: roboSoccer }, // Dummy 18 (Evening)
      { weekday: 4, hour: 20, userIdx: 19, event: roboSoccer }, // Dummy 19 (Night)
      
      // Friday (5)
      { weekday: 5, hour: 9, userIdx: 0, event: resumeClinic }, // Ananya (Morning)
      { weekday: 5, hour: 10, userIdx: 4, event: aiLecture }, // Rahul Sharma (Morning) -> AI Frontier
      { weekday: 5, hour: 12, userIdx: 20, event: resumeClinic }, // Dummy 20 (Midday)
      { weekday: 5, hour: 16, userIdx: 21, event: resumeClinic }, // Dummy 21 (Evening)
      { weekday: 5, hour: 19, userIdx: 22, event: resumeClinic }, // Dummy 22 (Evening)
      
      // Saturday (6)
      { weekday: 6, hour: 9, userIdx: 0, event: byteCode }, // Ananya (Morning)
      { weekday: 6, hour: 12, userIdx: 23, event: byteCode }, // Dummy 23 (Midday)
      { weekday: 6, hour: 14, userIdx: 24, event: byteCode }, // Dummy 24 (Afternoon)
      { weekday: 6, hour: 17, userIdx: 25, event: byteCode }, // Dummy 25 (Evening)
      { weekday: 6, hour: 20, userIdx: 26, event: byteCode }, // Dummy 26 (Night)
      
      // Remaining check-ins for Ananya (total 9 check-ins)
      { weekday: 0, hour: 10, userIdx: 0, event: debate }, // Sunday Morning
      { weekday: 1, hour: 9, userIdx: 0, event: resumeClinic },  // Monday Morning
      
      // Extra check-in to make it 38
      { weekday: 3, hour: 17, userIdx: 27, event: resumeClinic }, // Dummy 27 (Evening)
    ];

    const getStudentByUserIdx = (idx) => {
      if (idx === 0) return ananya;
      if (idx === 1) return vikram;
      if (idx === 2) return priya;
      if (idx === 3) return arjun;
      if (idx === 4) return rahul;
      return allStudents[idx + 10];
    };

    // Insert attendance and check-in rows
    for (let specIdx = 0; specIdx < checkinSpecs.length; specIdx++) {
      const spec = checkinSpecs[specIdx];
      const studentObj = getStudentByUserIdx(spec.userIdx);
      
      const checkinDate = getPastDateForWeekday(spec.weekday, 3 + (specIdx % 15), spec.hour);
      const regDate = new Date(checkinDate.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days before check-in

      const { regId, ticketId } = await registerUser(studentObj, spec.event, regDate, 'completed', 'present');

      if (ticketId) {
        await client.query(`
          INSERT INTO attendance (ticket_id, checkin_time)
          VALUES ($1, $2)
          ON CONFLICT (ticket_id) DO UPDATE SET checkin_time = EXCLUDED.checkin_time
        `, [ticketId, formatSqlDate(checkinDate)]);
      }
    }

    // Double check Rahul Sharma's attendance on AI Frontier
    const rahulLectureReg = await client.query('SELECT id FROM registrations WHERE user_id = $1 AND event_id = $2', [rahul.id, aiLecture.id]);
    const rahulLectureRegId = rahulLectureReg.rows[0].id;
    const ticketRes = await client.query('SELECT id FROM tickets WHERE registration_id = $1', [rahulLectureRegId]);
    let rahulLectureTicketId;
    if (ticketRes.rows.length === 0) {
      const ticketNum = 'CP-ALEC-SHARMA-001';
      const tRes = await client.query('INSERT INTO tickets (registration_id, ticket_number, qr_code) VALUES ($1, $2, $3) RETURNING id', [rahulLectureRegId, ticketNum, ticketNum]);
      rahulLectureTicketId = tRes.rows[0].id;
    } else {
      rahulLectureTicketId = ticketRes.rows[0].id;
    }
    await client.query(`
      INSERT INTO attendance (ticket_id, checkin_time)
      VALUES ($1, $2)
      ON CONFLICT (ticket_id) DO NOTHING
    `, [rahulLectureTicketId, formatSqlDate(new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000))]);

    await client.query('UPDATE registrations SET attendance_status = \'present\' WHERE id = $1', [rahulLectureRegId]);

    // Priya Patel's ByteCode check-in mapping consistency
    if (JunePriyaByteRes.ticketId) {
      await client.query(`
        INSERT INTO attendance (ticket_id, checkin_time)
        VALUES ($1, $2)
        ON CONFLICT (ticket_id) DO NOTHING
      `, [JunePriyaByteRes.ticketId, formatSqlDate(new Date(event5Date.getTime() + 15 * 60 * 1000))]);
    }

    console.log('Leaderboard specific check-ins created.');

    // ── 1A. CORE EVENTS REMAINING REGISTRATIONS (to hit exact capacity counts) ──
    console.log('Filling registrations to match capacities from Section 1A...');

    const fillCapacity = async (event, targetCount) => {
      // Find current registrations
      const countRes = await client.query('SELECT COUNT(*)::int as count FROM registrations WHERE event_id = $1', [event.id]);
      const currentCount = countRes.rows[0].count;
      
      const needed = targetCount - currentCount;
      console.log(`Event: ${event.title}, Current Regs: ${currentCount}, Target: ${targetCount}, Needed: ${needed}`);
      
      if (needed <= 0) return;

      // Find user IDs already registered for this event
      const existingUsersRes = await client.query('SELECT user_id FROM registrations WHERE event_id = $1', [event.id]);
      const existingUserIds = new Set(existingUsersRes.rows.map(r => r.user_id));

      let added = 0;
      for (const student of allStudents) {
        if (added >= needed) break;
        if (!existingUserIds.has(student.id)) {
          const regDate = new Date(now.getTime() - (Math.floor(Math.random() * 8) + 1) * 24 * 60 * 60 * 1000);
          await registerUser(student, event, regDate, 'completed', 'absent');
          added++;
        }
      }
    };

    // Capacity targets
    await fillCapacity(byteCode, 35);
    await fillCapacity(aiLecture, 52);
    await fillCapacity(sports, 89);
    await fillCapacity(hackSummit, 67);
    await fillCapacity(rhythm, 210);

    // Verify final counts
    const finalCounts = await client.query(`
      SELECT e.title, COUNT(r.id)::int as count
      FROM events e
      LEFT JOIN registrations r ON e.id = r.event_id
      WHERE e.id IN ($1, $2, $3, $4, $5)
      GROUP BY e.id, e.title
    `, [byteCode.id, aiLecture.id, sports.id, hackSummit.id, rhythm.id]);
    
    console.log('Final Seed Verification Counts:');
    finalCounts.rows.forEach(row => {
      console.log(` - ${row.title}: ${row.count} registrations`);
    });

    console.log('Seeding pre-issued certificates...');
    const rahulCertReg = await client.query('SELECT id FROM registrations WHERE user_id = $1 AND event_id = $2', [rahul.id, aiLecture.id]);
    const ananyaCertReg = await client.query('SELECT id FROM registrations WHERE user_id = $1 AND event_id = $2', [ananya.id, webdevWS.id]);
    const vikramCertReg = await client.query('SELECT id FROM registrations WHERE user_id = $1 AND event_id = $2', [vikram.id, designSprint.id]);

    if (rahulCertReg.rows.length > 0) {
      await client.query(`
        INSERT INTO certificates (registration_id, user_id, event_id, certificate_id)
        VALUES ($1, $2, $3, 'CP-2026-AIFR-001-1234')
        ON CONFLICT DO NOTHING
      `, [rahulCertReg.rows[0].id, rahul.id, aiLecture.id]);
    }
    if (ananyaCertReg.rows.length > 0) {
      await client.query(`
        INSERT INTO certificates (registration_id, user_id, event_id, certificate_id)
        VALUES ($1, $2, $3, 'CP-2026-WEBD-002-5678')
        ON CONFLICT DO NOTHING
      `, [ananyaCertReg.rows[0].id, ananya.id, webdevWS.id]);
    }
    if (vikramCertReg.rows.length > 0) {
      await client.query(`
        INSERT INTO certificates (registration_id, user_id, event_id, certificate_id)
        VALUES ($1, $2, $3, 'CP-2026-DESG-003-9012')
        ON CONFLICT DO NOTHING
      `, [vikramCertReg.rows[0].id, vikram.id, designSprint.id]);
    }

    console.log('Database seeding completed successfully!');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

runSeed();
