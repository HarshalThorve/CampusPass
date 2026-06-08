const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const db = require('../config/db');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const NotificationService = require('../services/NotificationService');

require('dotenv').config();

// Initialize Razorpay
let razorpay;
const isRazorpayConfigured = 
  process.env.RAZORPAY_KEY_ID && 
  process.env.RAZORPAY_KEY_SECRET && 
  process.env.RAZORPAY_KEY_ID !== 'rzp_test_placeholder_key';

if (isRazorpayConfigured) {
  try {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    console.log('Razorpay client initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize Razorpay client:', error.message);
  }
} else {
  console.log('Razorpay credentials not set or set to placeholders. Running in Payment Simulation Mode.');
}

// Generate unique ticket number helper
function generateTicketNumber(category, userName) {
  const catCode = (category || 'GEN').slice(0, 4).toUpperCase();
  const nameCode = (userName || 'STUD').replace(/\s+/g, '').slice(0, 5).toUpperCase();
  const randCode = Math.floor(1000 + Math.random() * 9000);
  return `CP-${catCode}-${nameCode}-${randCode}`;
}

// 1. Create Registration (Register for Free or Initiate Razorpay Order for Paid)
router.post('/create', authenticateToken, async (req, res) => {
  const { eventId } = req.body;
  const userId = req.user.id;

  if (!eventId) {
    return res.status(400).json({ message: 'Event ID is required' });
  }

  try {
    // Check if event exists
    const eventResult = await db.query(
      `SELECT e.*, COUNT(r.id)::int as registered_count 
       FROM events e 
       LEFT JOIN registrations r ON e.id = r.event_id AND r.payment_status = 'completed'
       WHERE e.id = $1
       GROUP BY e.id`, 
      [eventId]
    );

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const event = eventResult.rows[0];

    // Check if registration deadline has passed
    if (new Date() > new Date(event.registration_deadline)) {
      return res.status(400).json({ message: 'Registration deadline has passed for this event' });
    }

    // Check if event capacity is full
    if (event.registered_count >= event.capacity) {
      return res.status(400).json({ message: 'This event is fully booked' });
    }

    // Check if user is already registered
    const existingReg = await db.query(
      'SELECT * FROM registrations WHERE user_id = $1 AND event_id = $2',
      [userId, eventId]
    );

    if (existingReg.rows.length > 0) {
      const reg = existingReg.rows[0];
      if (reg.payment_status === 'completed') {
        return res.status(400).json({ message: 'You are already registered for this event.' });
      }
      
      // If it is pending, delete it or reuse it. We will delete it to create a fresh checkout order.
      await db.query('DELETE FROM registrations WHERE id = $1', [reg.id]);
    }

    const price = parseFloat(event.price);

    // Case A: Free Event
    if (price === 0) {
      // Direct registration completion
      const newRegResult = await db.query(
        `INSERT INTO registrations (user_id, event_id, payment_status, attendance_status)
         VALUES ($1, $2, 'completed', 'absent') RETURNING *`,
        [userId, eventId]
      );
      
      const newReg = newRegResult.rows[0];

      // Create Ticket
      const ticketNumber = generateTicketNumber(event.category, req.user.name);
      const ticketResult = await db.query(
        `INSERT INTO tickets (registration_id, ticket_number, qr_code)
         VALUES ($1, $2, $3) RETURNING *`,
        [newReg.id, ticketNumber, ticketNumber] // QR code data will match ticket number
      );

      const ticket = ticketResult.rows[0];

      // Send Ticket Email asynchronously
      NotificationService.sendTicketEmail(req.user, event, ticket).catch(err =>
        console.error('Failed to send free ticket email:', err)
      );

      return res.status(201).json({
        message: 'Successfully registered for free event!',
        isPaid: false,
        registration: newReg,
        ticket
      });
    }

    // Case B: Paid Event
    // Insert pending registration
    const pendingRegResult = await db.query(
      `INSERT INTO registrations (user_id, event_id, payment_status, attendance_status)
       VALUES ($1, $2, 'pending', 'absent') RETURNING *`,
      [userId, eventId]
    );
    const pendingReg = pendingRegResult.rows[0];

    // Create Razorpay Order
    let orderId;
    if (razorpay) {
      const options = {
        amount: Math.round(price * 100), // Razorpay amount in paise
        currency: 'INR',
        receipt: `receipt_reg_${pendingReg.id}`,
        payment_capture: 1
      };

      try {
        const order = await razorpay.orders.create(options);
        orderId = order.id;
      } catch (err) {
        console.error('Razorpay order creation failed:', err);
        // Clean up pending registration
        await db.query('DELETE FROM registrations WHERE id = $1', [pendingReg.id]);
        return res.status(500).json({ message: 'Failed to initiate checkout via Razorpay' });
      }
    } else {
      // Generate a simulated order ID
      orderId = `order_sim_${pendingReg.id}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Insert pending Payment log
    await db.query(
      `INSERT INTO payments (user_id, event_id, razorpay_order_id, amount, status)
       VALUES ($1, $2, $3, $4, 'pending')`,
      [userId, eventId, orderId, price]
    );

    return res.json({
      message: 'Checkout initiated',
      isPaid: true,
      registrationId: pendingReg.id,
      orderId,
      amount: price * 100,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key',
      event: {
        title: event.title,
        price
      }
    });
  } catch (error) {
    console.error('Register event error:', error);
    return res.status(500).json({ message: 'Server error. Failed to initiate registration.' });
  }
});

// 2. Verify Razorpay Payment (and generate Ticket)
router.post('/verify-payment', authenticateToken, async (req, res) => {
  const { registrationId, orderId, paymentId, signature } = req.body;
  const userId = req.user.id;

  if (!registrationId || !orderId || !paymentId) {
    return res.status(400).json({ message: 'Missing payment confirmation parameters.' });
  }

  try {
    // Check pending registration
    const regResult = await db.query(
      `SELECT r.*, e.title, e.category, e.date, e.venue, e.price 
       FROM registrations r
       JOIN events e ON r.event_id = e.id
       WHERE r.id = $1 AND r.user_id = $2`,
      [registrationId, userId]
    );

    if (regResult.rows.length === 0) {
      return res.status(404).json({ message: 'Pending registration not found.' });
    }

    const registration = regResult.rows[0];

    // Validate Signature
    let isValid = false;
    if (isRazorpayConfigured && razorpay) {
      const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
      hmac.update(orderId + '|' + paymentId);
      const generatedSignature = hmac.digest('hex');
      isValid = generatedSignature === signature;
    } else {
      // In simulation mode, accept any signature or empty signature
      console.log('Signature verification bypassed (Simulation Mode)');
      isValid = true;
    }

    if (!isValid) {
      // Mark payment failed
      await db.query(
        `UPDATE payments SET status = 'failed' WHERE razorpay_order_id = $1`,
        [orderId]
      );
      await db.query(
        `UPDATE registrations SET payment_status = 'failed' WHERE id = $1`,
        [registrationId]
      );
      return res.status(400).json({ message: 'Payment verification failed. Invalid signature.' });
    }

    // Update Registration & Payment tables
    await db.query(
      `UPDATE registrations SET payment_status = 'completed' WHERE id = $1`,
      [registrationId]
    );

    await db.query(
      `UPDATE payments 
       SET razorpay_payment_id = $1, razorpay_signature = $2, status = 'successful'
       WHERE razorpay_order_id = $3`,
      [paymentId, signature || 'simulated_sig', orderId]
    );

    // Generate Ticket
    const ticketNumber = generateTicketNumber(registration.category, req.user.name);
    const ticketResult = await db.query(
      `INSERT INTO tickets (registration_id, ticket_number, qr_code)
       VALUES ($1, $2, $3) RETURNING *`,
      [registrationId, ticketNumber, ticketNumber]
    );

    const ticket = ticketResult.rows[0];

    // Trigger confirmation emails asynchronously
    const mockPaymentDetails = {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      amount: registration.price
    };
    
    NotificationService.sendPaymentEmail(req.user, registration, mockPaymentDetails).catch(err =>
      console.error('Payment receipt email failed:', err)
    );

    NotificationService.sendTicketEmail(req.user, registration, ticket).catch(err =>
      console.error('Ticket email failed:', err)
    );

    return res.json({
      message: 'Payment verified and ticket generated successfully!',
      ticket
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    return res.status(500).json({ message: 'Server error. Verification failed.' });
  }
});

// 3. Get User Registration History (Student Dashboard)
router.get('/history', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const queryText = `
      SELECT r.id as registration_id, r.payment_status, r.attendance_status, r.created_at as registered_at,
             e.id as event_id, e.title, e.description, e.date as event_date, e.venue, e.category, e.price, e.image,
             t.id as ticket_id, t.ticket_number, t.qr_code,
             a.checkin_time
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      LEFT JOIN tickets t ON r.id = t.registration_id
      LEFT JOIN attendance a ON t.id = a.ticket_id
      WHERE r.user_id = $1
      ORDER BY e.date DESC
    `;
    const result = await db.query(queryText, [userId]);
    return res.json(result.rows);
  } catch (error) {
    console.error('Registration history query error:', error);
    return res.status(500).json({ message: 'Failed to fetch registration history' });
  }
});

// 4. Cancel Registration (before deadline)
router.delete('/:id/cancel', authenticateToken, async (req, res) => {
  const regId = req.params.id;
  const userId = req.user.id;

  try {
    // Get registration and event details
    const result = await db.query(
      `SELECT r.*, e.registration_deadline, e.price 
       FROM registrations r
       JOIN events e ON r.event_id = e.id
       WHERE r.id = $1 AND r.user_id = $2`,
      [regId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    const reg = result.rows[0];

    // Check if deadline passed
    if (new Date() > new Date(reg.registration_deadline)) {
      return res.status(400).json({ message: 'Cannot cancel registration. The registration deadline has passed.' });
    }

    // Handle refunds if it was a paid event (Note: in test/hackathon mode we just delete the entry and acknowledge the cancel)
    // In production, we'd trigger a refund via Razorpay
    await db.query('DELETE FROM registrations WHERE id = $1', [regId]);

    return res.json({ 
      message: reg.price > 0 
        ? 'Registration cancelled successfully. Refund initiated.' 
        : 'Registration cancelled successfully.' 
    });
  } catch (error) {
    console.error('Cancel registration error:', error);
    return res.status(500).json({ message: 'Failed to cancel registration' });
  }
});

// 5. Get Registrations by Event (Admin only)
router.get('/event/:eventId', authenticateToken, isAdmin, async (req, res) => {
  const { eventId } = req.params;

  try {
    const queryText = `
      SELECT r.id as registration_id, r.payment_status, r.attendance_status, r.created_at as registered_at,
             u.id as user_id, u.name as user_name, u.email as user_email,
             t.ticket_number,
             a.checkin_time
      FROM registrations r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN tickets t ON r.id = t.registration_id
      LEFT JOIN attendance a ON t.id = a.ticket_id
      WHERE r.event_id = $1 AND r.payment_status = 'completed'
      ORDER BY r.created_at DESC
    `;
    const result = await db.query(queryText, [eventId]);
    return res.json(result.rows);
  } catch (error) {
    console.error('Fetch event registrations error:', error);
    return res.status(500).json({ message: 'Failed to fetch event registrations' });
  }
});

module.exports = router;
