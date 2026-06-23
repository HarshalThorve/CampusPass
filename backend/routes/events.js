const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Get all events (Public, with filters & search)
router.get('/', async (req, res) => {
  const { search, category, maxPrice, upcomingOnly } = req.query;
  
  let queryText = `
    SELECT e.*, 
           COUNT(r.id)::int as registered_count,
           (e.capacity - COUNT(r.id)::int) as available_seats
    FROM events e 
    LEFT JOIN registrations r ON e.id = r.event_id AND r.payment_status = 'completed'
  `;
  
  const queryParams = [];
  const clauses = [];

  if (search) {
    queryParams.push(`%${search.trim()}%`);
    clauses.push(`(e.title ILIKE $${queryParams.length} OR e.description ILIKE $${queryParams.length} OR e.venue ILIKE $${queryParams.length})`);
  }

  if (category) {
    queryParams.push(category);
    clauses.push(`e.category = $${queryParams.length}`);
  }

  if (maxPrice) {
    queryParams.push(parseFloat(maxPrice));
    clauses.push(`e.price <= $${queryParams.length}`);
  }

  if (upcomingOnly === 'true') {
    clauses.push(`e.date >= NOW()`);
  }

  if (clauses.length > 0) {
    queryText += ' WHERE ' + clauses.join(' AND ');
  }

  queryText += ' GROUP BY e.id ORDER BY e.date ASC';

  try {
    const result = await db.query(queryText, queryParams);
    return res.json(result.rows);
  } catch (error) {
    console.error('Fetch events error:', error);
    return res.status(500).json({ message: 'Failed to fetch events' });
  }
});

// Get single event details (Public)
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const queryText = `
      SELECT e.*, 
             COUNT(r.id)::int as registered_count,
             (e.capacity - COUNT(r.id)::int) as available_seats
      FROM events e 
      LEFT JOIN registrations r ON e.id = r.event_id AND r.payment_status = 'completed'
      WHERE e.id = $1
      GROUP BY e.id
    `;
    const result = await db.query(queryText, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Fetch event details error:', error);
    return res.status(500).json({ message: 'Failed to fetch event details' });
  }
});

// Create Event (Admin only)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  const { 
    title, description, date, venue, category, price, capacity, image, 
    registration_deadline, issues_certificate,
    certificate_institution, certificate_signatory_name, 
    certificate_signatory_title, certificate_footer_text,
    certificate_theme, certificate_background_url
  } = req.body;

  if (!title || !description || !date || !venue || !category || capacity === undefined || !registration_deadline) {
    return res.status(400).json({ message: 'Please provide all required fields.' });
  }

  const CERTIFICATE_ELIGIBLE = ['technical', 'academic', 'sports'];
  const issuesCertValue = issues_certificate !== undefined
    ? issues_certificate
    : CERTIFICATE_ELIGIBLE.includes((category || '').toLowerCase());

  try {
    const CATEGORY_IMAGES = {
      technical: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
      sports: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
      cultural: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
      academic: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80'
    };
    const finalImage = image || CATEGORY_IMAGES[category.trim().toLowerCase()] || CATEGORY_IMAGES.technical;

    const result = await db.query(
      `INSERT INTO events (title, description, date, venue, category, price, capacity, image, registration_deadline, issues_certificate, certificate_institution, certificate_signatory_name, certificate_signatory_title, certificate_footer_text, certificate_theme, certificate_background_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *`,
      [
        title.trim(),
        description.trim(),
        date,
        venue.trim(),
        category.trim(),
        price || 0.00,
        capacity,
        finalImage,
        registration_deadline,
        issuesCertValue,
        certificate_institution ? certificate_institution.trim() : 'CampusPass Institute',
        certificate_signatory_name ? certificate_signatory_name.trim() : 'Admin User',
        certificate_signatory_title ? certificate_signatory_title.trim() : 'Event Coordinator',
        certificate_footer_text ? certificate_footer_text.trim() : 'This certificate is digitally verified by CampusPass.',
        certificate_theme ? certificate_theme.trim() : 'cream',
        certificate_background_url ? certificate_background_url.trim() : null
      ]
    );

    return res.status(201).json({
      message: 'Event created successfully',
      event: result.rows[0]
    });
  } catch (error) {
    console.error('Create event error:', error);
    return res.status(500).json({ message: 'Failed to create event.' });
  }
});

// Update Event (Admin only)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { 
    title, description, date, venue, category, price, capacity, image, 
    registration_deadline, issues_certificate,
    certificate_institution, certificate_signatory_name, 
    certificate_signatory_title, certificate_footer_text,
    certificate_theme, certificate_background_url
  } = req.body;

  if (!title || !description || !date || !venue || !category || capacity === undefined || !registration_deadline) {
    return res.status(400).json({ message: 'Please provide all required fields.' });
  }

  const CERTIFICATE_ELIGIBLE = ['technical', 'academic', 'sports'];
  const issuesCertValue = issues_certificate !== undefined
    ? issues_certificate
    : CERTIFICATE_ELIGIBLE.includes((category || '').toLowerCase());

  try {
    const checkExists = await db.query('SELECT * FROM events WHERE id = $1', [id]);
    if (checkExists.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const CATEGORY_IMAGES = {
      technical: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
      sports: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
      cultural: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
      academic: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80'
    };
    const finalImage = image || CATEGORY_IMAGES[category.trim().toLowerCase()] || CATEGORY_IMAGES.technical;

    const result = await db.query(
      `UPDATE events 
       SET title = $1, description = $2, date = $3, venue = $4, category = $5, 
           price = $6, capacity = $7, image = $8, registration_deadline = $9,
           issues_certificate = $10, certificate_institution = $11, 
           certificate_signatory_name = $12, certificate_signatory_title = $13, 
           certificate_footer_text = $14, certificate_theme = $15, certificate_background_url = $16
       WHERE id = $17 RETURNING *`,
      [
        title.trim(),
        description.trim(),
        date,
        venue.trim(),
        category.trim(),
        price || 0.00,
        capacity,
        finalImage,
        registration_deadline,
        issuesCertValue,
        certificate_institution ? certificate_institution.trim() : 'CampusPass Institute',
        certificate_signatory_name ? certificate_signatory_name.trim() : 'Admin User',
        certificate_signatory_title ? certificate_signatory_title.trim() : 'Event Coordinator',
        certificate_footer_text ? certificate_footer_text.trim() : 'This certificate is digitally verified by CampusPass.',
        certificate_theme ? certificate_theme.trim() : 'cream',
        certificate_background_url ? certificate_background_url.trim() : null,
        id
      ]
    );

    return res.json({
      message: 'Event updated successfully',
      event: result.rows[0]
    });
  } catch (error) {
    console.error('Update event error:', error);
    return res.status(500).json({ message: 'Failed to update event.' });
  }
});

// Delete Event (Admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const checkExists = await db.query('SELECT * FROM events WHERE id = $1', [id]);
    if (checkExists.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    await db.query('DELETE FROM events WHERE id = $1', [id]);
    return res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    return res.status(500).json({ message: 'Failed to delete event. It might have associated registrations.' });
  }
});

module.exports = router;
