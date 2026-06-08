const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Get ticket details by Ticket ID
router.get('/:id', authenticateToken, async (req, res) => {
  const ticketId = req.params.id;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    const queryText = `
      SELECT t.*, 
             r.user_id, r.payment_status, r.attendance_status,
             e.title as event_title, e.description as event_description, e.date as event_date, e.venue as event_venue, e.category as event_category, e.price as event_price, e.image as event_image,
             u.name as user_name, u.email as user_email,
             a.checkin_time
      FROM tickets t
      JOIN registrations r ON t.registration_id = r.id
      JOIN events e ON r.event_id = e.id
      JOIN users u ON r.user_id = u.id
      LEFT JOIN attendance a ON t.id = a.ticket_id
      WHERE t.id = $1
    `;
    const result = await db.query(queryText, [ticketId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const ticket = result.rows[0];

    // Access control: Only the registered user or an admin can view the ticket details
    if (userRole !== 'admin' && ticket.user_id !== userId) {
      return res.status(403).json({ message: 'Forbidden. You do not have permission to view this ticket.' });
    }

    return res.json(ticket);
  } catch (error) {
    console.error('Fetch ticket error:', error);
    return res.status(500).json({ message: 'Failed to fetch ticket details' });
  }
});

// Get ticket details by Registration ID
router.get('/registration/:registrationId', authenticateToken, async (req, res) => {
  const { registrationId } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    const queryText = `
      SELECT t.*, 
             r.user_id, r.payment_status, r.attendance_status,
             e.title as event_title, e.date as event_date, e.venue as event_venue,
             u.name as user_name,
             a.checkin_time
      FROM tickets t
      JOIN registrations r ON t.registration_id = r.id
      JOIN events e ON r.event_id = e.id
      JOIN users u ON r.user_id = u.id
      LEFT JOIN attendance a ON t.id = a.ticket_id
      WHERE t.registration_id = $1
    `;
    const result = await db.query(queryText, [registrationId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Ticket not found for this registration' });
    }

    const ticket = result.rows[0];

    // Access control: Only the registered user or an admin can view the ticket details
    if (userRole !== 'admin' && ticket.user_id !== userId) {
      return res.status(403).json({ message: 'Forbidden. You do not have permission to view this ticket.' });
    }

    return res.json(ticket);
  } catch (error) {
    console.error('Fetch ticket by registration error:', error);
    return res.status(500).json({ message: 'Failed to fetch ticket details' });
  }
});

module.exports = router;
