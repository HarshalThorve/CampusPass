const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const NotificationService = require('../services/NotificationService');

require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'campuspass_super_secret_jwt_key_2026_dev';

// Register User
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if user already exists
    const userExists = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user (default role is student)
    const result = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name.trim(), email.toLowerCase().trim(), passwordHash, 'student']
    );

    const newUser = result.rows[0];

    // Trigger Welcome Email asynchronously
    NotificationService.sendWelcomeEmail(newUser).catch(err => 
      console.error('Welcome email failed to send:', err)
    );

    // Generate JWT
    const token = jwt.sign(
      { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server error. Failed to register user.' });
  }
});

// Login User
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Check user
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Verify Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error. Failed to log in.' });
  }
});

// Get Current User Profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, email, role, created_at FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Fetch user error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Google Login / Registration Synchronizer
router.post('/google-login', async (req, res) => {
  const { name, email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    // 1. Look up user by email (case-insensitive)
    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    let user;

    if (userResult.rows.length === 0) {
      // 2. User doesn't exist, register them as a student
      // Generate a random password hash since they use Google login
      const salt = await bcrypt.genSalt(10);
      const dummyPassword = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const passwordHash = await bcrypt.hash(dummyPassword, salt);

      const insertResult = await db.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
        [name ? name.trim() : 'Google User', email.toLowerCase().trim(), passwordHash, 'student']
      );
      user = insertResult.rows[0];

      // Trigger Welcome Email asynchronously
      NotificationService.sendWelcomeEmail(user).catch(err => 
        console.error('Welcome email failed to send:', err)
      );
    } else {
      user = userResult.rows[0];
    }

    // 3. Generate Express JWT
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Google login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    return res.status(500).json({ message: 'Server error. Failed to authenticate via Google.' });
  }
});

module.exports = router;

