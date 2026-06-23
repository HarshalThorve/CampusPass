const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

const CERTIFICATE_ELIGIBLE = ['technical', 'academic', 'sports'];

// Generate unique certificate ID
function generateCertificateId(eventTitle, userId) {
  const prefix = 'CP';
  const eventCode = eventTitle
    .replace(/[^a-zA-Z]/g, '')
    .toUpperCase()
    .slice(0, 4);
  const userCode = String(userId).padStart(3, '0');
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `${prefix}-${year}-${eventCode}-${userCode}-${random}`;
}

// GET /api/certificates/check/:registrationId
// Check if a certificate is eligible and already issued
router.get('/check/:registrationId', authenticateToken, async (req, res) => {
  try {
    const { registrationId } = req.params;

    const result = await pool.query(`
      SELECT 
        r.id as registration_id,
        r.attendance_status,
        r.payment_status,
        e.title as event_title,
        e.category,
        e.date as event_date,
        e.issues_certificate,
        u.name as student_name,
        u.email as student_email,
        c.certificate_id,
        c.issued_at
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      JOIN users u ON r.user_id = u.id
      LEFT JOIN certificates c ON c.registration_id = r.id
      WHERE r.id = $1 AND r.user_id = $2
    `, [registrationId, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Registration not found.' });
    }

    const data = result.rows[0];
    const isEligible = 
      CERTIFICATE_ELIGIBLE.includes(data.category.toLowerCase()) &&
      data.issues_certificate &&
      data.attendance_status === 'present' &&
      data.payment_status === 'completed';

    return res.json({
      eligible: isEligible,
      alreadyIssued: !!data.certificate_id,
      certificateId: data.certificate_id || null,
      issuedAt: data.issued_at || null,
      reason: !isEligible ? (
        !CERTIFICATE_ELIGIBLE.includes(data.category.toLowerCase())
          ? 'Cultural events do not issue certificates.'
          : data.attendance_status !== 'present'
          ? 'You must attend the event to receive a certificate.'
          : 'Payment not completed.'
      ) : null,
      eventData: {
        title: data.event_title,
        category: data.category,
        date: data.event_date,
        studentName: data.student_name,
        studentEmail: data.student_email,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/certificates/issue/:registrationId
// Issue a certificate for an eligible registration
router.post('/issue/:registrationId', authenticateToken, async (req, res) => {
  try {
    const { registrationId } = req.params;

    // Fetch registration + event + user details
    const result = await pool.query(`
      SELECT 
        r.id, r.user_id, r.event_id,
        r.attendance_status, r.payment_status,
        e.title, e.category, e.date, e.issues_certificate,
        e.certificate_institution, e.certificate_signatory_name,
        e.certificate_signatory_title, e.certificate_footer_text,
        e.certificate_theme, e.certificate_background_url,
        u.name, u.email
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      JOIN users u ON r.user_id = u.id
      WHERE r.id = $1 AND r.user_id = $2
    `, [registrationId, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Registration not found.' });
    }

    const reg = result.rows[0];

    // Enforce eligibility
    if (!CERTIFICATE_ELIGIBLE.includes(reg.category.toLowerCase())) {
      return res.status(403).json({
        error: 'Certificates are not issued for cultural events.'
      });
    }
    if (!reg.issues_certificate) {
      return res.status(403).json({
        error: 'Certificate issuance is disabled for this event.'
      });
    }
    if (reg.attendance_status !== 'present') {
      return res.status(403).json({
        error: 'Attendance required to issue certificate.'
      });
    }

    // Check if already issued
    const existing = await pool.query(
      'SELECT certificate_id FROM certificates WHERE registration_id = $1',
      [registrationId]
    );

    // Map event-specific template settings to the settings object
    const settings = {
      institution_name: reg.certificate_institution || 'CampusPass Institute',
      organizer_name: reg.certificate_signatory_name || 'Admin User',
      organizer_title: reg.certificate_signatory_title || 'Event Coordinator',
      footer_text: reg.certificate_footer_text || 'This certificate is digitally verified by CampusPass.',
      certificate_theme: reg.certificate_theme || 'cream',
      certificate_background_url: reg.certificate_background_url || null
    };

    if (existing.rows.length > 0) {
      return res.json({ 
        certificateId: existing.rows[0].certificate_id,
        alreadyIssued: true,
        studentName: reg.name,
        eventTitle: reg.title,
        eventDate: reg.date,
        eventCategory: reg.category,
        settings: settings
      });
    }

    // Generate and store new certificate
    const certificateId = generateCertificateId(reg.title, reg.user_id);
    await pool.query(`
      INSERT INTO certificates 
        (registration_id, user_id, event_id, certificate_id)
      VALUES ($1, $2, $3, $4)
    `, [registrationId, reg.user_id, reg.event_id, certificateId]);

    return res.json({
      certificateId,
      alreadyIssued: false,
      studentName: reg.name,
      eventTitle: reg.title,
      eventDate: reg.date,
      eventCategory: reg.category,
      settings: settings
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/certificates/settings (any authenticated user — needed to render the template)
router.get('/settings', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM certificate_settings LIMIT 1'
    );
    res.json(result.rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/certificates/settings (Admin only)
router.put('/settings', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin only.' });
    }
    const { 
      institution_name, 
      organizer_name, 
      organizer_title, 
      footer_text 
    } = req.body;

    const result = await pool.query(`
      UPDATE certificate_settings SET
        institution_name = $1,
        organizer_name   = $2,
        organizer_title  = $3,
        footer_text      = $4,
        updated_at       = NOW()
      WHERE id = 1
      RETURNING *
    `, [institution_name, organizer_name, organizer_title, footer_text]);

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
