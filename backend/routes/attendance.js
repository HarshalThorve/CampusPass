const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Scan and Verify Ticket (Admin only)
router.post('/scan', authenticateToken, isAdmin, async (req, res) => {
  const { ticketNumber } = req.body;

  if (!ticketNumber) {
    return res.status(400).json({ message: 'Ticket number is required' });
  }

  try {
    // 1. Fetch ticket and registration status
    const queryText = `
      SELECT t.id as ticket_id, t.ticket_number,
             r.id as registration_id, r.payment_status, r.attendance_status,
             e.id as event_id, e.title as event_title, e.date as event_date, e.venue as event_venue,
             u.id as user_id, u.name as user_name, u.email as user_email
      FROM tickets t
      JOIN registrations r ON t.registration_id = r.id
      JOIN events e ON r.event_id = e.id
      JOIN users u ON r.user_id = u.id
      WHERE t.ticket_number = $1
    `;
    const result = await db.query(queryText, [ticketNumber.trim()]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        status: 'invalid',
        message: 'Invalid ticket. No match found in the database.' 
      });
    }

    const ticket = result.rows[0];

    // 2. Check if payment is successful
    if (ticket.payment_status !== 'completed') {
      return res.status(400).json({
        success: false,
        status: 'unpaid',
        message: `Ticket registration is incomplete (Status: ${ticket.payment_status}).`
      });
    }

    // 3. Check if already checked in
    const checkinQuery = await db.query('SELECT * FROM attendance WHERE ticket_id = $1', [ticket.ticket_id]);
    if (checkinQuery.rows.length > 0) {
      const existingCheckin = checkinQuery.rows[0];
      return res.status(400).json({
        success: false,
        status: 'checked_in',
        message: 'Attendance already recorded for this ticket.',
        ticketInfo: {
          userName: ticket.user_name,
          eventTitle: ticket.event_title,
          checkinTime: existingCheckin.checkin_time
        }
      });
    }

    // 4. Record attendance
    const now = new Date();
    await db.query(
      'INSERT INTO attendance (ticket_id, checkin_time) VALUES ($1, $2)',
      [ticket.ticket_id, now]
    );

    // 5. Update registration status to 'present'
    await db.query(
      "UPDATE registrations SET attendance_status = 'present' WHERE id = $1",
      [ticket.registration_id]
    );

    return res.json({
      success: true,
      status: 'success',
      message: 'Attendance recorded successfully!',
      ticketInfo: {
        ticketNumber: ticket.ticket_number,
        userName: ticket.user_name,
        userEmail: ticket.user_email,
        eventTitle: ticket.event_title,
        venue: ticket.event_venue,
        checkinTime: now
      }
    });
  } catch (error) {
    console.error('QR Checkin scan error:', error);
    return res.status(500).json({ message: 'Internal server error during check-in verification.' });
  }
});

// Get Check-in Attendance log for an Event (Admin only)
router.get('/event/:eventId', authenticateToken, isAdmin, async (req, res) => {
  const { eventId } = req.params;

  try {
    const queryText = `
      SELECT a.id as checkin_id, a.checkin_time,
             t.ticket_number,
             u.name as user_name, u.email as user_email
      FROM attendance a
      JOIN tickets t ON a.ticket_id = t.id
      JOIN registrations r ON t.registration_id = r.id
      JOIN users u ON r.user_id = u.id
      WHERE r.event_id = $1
      ORDER BY a.checkin_time DESC
    `;
    const result = await db.query(queryText, [eventId]);
    return res.json(result.rows);
  } catch (error) {
    console.error('Fetch event attendance error:', error);
    return res.status(500).json({ message: 'Failed to fetch attendance logs' });
  }
});

module.exports = router;
