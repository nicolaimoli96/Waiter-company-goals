const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/db');
const { authenticateToken } = require('../middleware/auth');
const config = require('../config');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, role = 'waiter', restaurant_id } = req.body;

    // Validate input
    if (!username || !email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Username, email, password, first name, and last name are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await db.get(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const result = await db.run(
      'INSERT INTO users (username, email, password_hash, first_name, last_name, role, restaurant_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [username, email, passwordHash, firstName, lastName, role, restaurant_id]
    );

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: result.id, 
        username, 
        email, 
        firstName,
        lastName,
        role,
        restaurant_id 
      },
      config.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: result.id,
        username,
        email,
        firstName,
        lastName,
        role,
        restaurant_id
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user
    const user = await db.get(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, username]
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update login count and last login
    await db.run(
      'UPDATE users SET login_count = login_count + 1, last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    // Log login history
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    await db.run(
      'INSERT INTO user_login_history (user_id, ip_address, user_agent) VALUES (?, ?, ?)',
      [user.id, ipAddress, userAgent]
    );

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        restaurant_id: user.restaurant_id
      },
      config.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        restaurant_id: user.restaurant_id,
        loginCount: user.login_count + 1
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Validate token
router.get('/validate', authenticateToken, async (req, res) => {
  try {
    // If we get here, the token is valid (authenticateToken middleware passed)
    res.json({ valid: true, user: req.user });
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(401).json({ valid: false, error: 'Invalid token' });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await db.get(
      'SELECT id, username, email, role, restaurant_id, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { username, email, restaurant_id } = req.body;
    const userId = req.user.id;

    // Check if username/email already exists (excluding current user)
    if (username || email) {
      const existingUser = await db.get(
        'SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?',
        [username || '', email || '', userId]
      );

      if (existingUser) {
        return res.status(400).json({ error: 'Username or email already exists' });
      }
    }

    // Update user
    const result = await db.run(
      'UPDATE users SET username = COALESCE(?, username), email = COALESCE(?, email), restaurant_id = COALESCE(?, restaurant_id), updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [username, email, restaurant_id, userId]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get updated user
    const updatedUser = await db.get(
      'SELECT id, username, email, role, restaurant_id, created_at FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Google OAuth registration/login
router.post('/google', async (req, res) => {
  try {
    const { googleId, email, firstName, lastName, profilePicture } = req.body;

    if (!googleId || !email || !firstName || !lastName) {
      return res.status(400).json({ error: 'Google authentication data is incomplete' });
    }

    // Check if user exists with Google ID
    let user = await db.get(
      'SELECT * FROM users WHERE google_id = ?',
      [googleId]
    );

    if (!user) {
      // Check if user exists with email
      user = await db.get(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      if (user) {
        // Link Google account to existing user
        await db.run(
          'UPDATE users SET google_id = ?, profile_picture = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [googleId, profilePicture, user.id]
        );
      } else {
        // Create new user with Google account
        const username = email.split('@')[0] + '_' + Date.now();
        const result = await db.run(
          'INSERT INTO users (username, email, first_name, last_name, google_id, profile_picture, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [username, email, firstName, lastName, googleId, profilePicture, 'waiter']
        );
        
        user = await db.get('SELECT * FROM users WHERE id = ?', [result.id]);
      }
    }

    // Update login count and last login
    await db.run(
      'UPDATE users SET login_count = login_count + 1, last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    // Log login history
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    await db.run(
      'INSERT INTO user_login_history (user_id, ip_address, user_agent) VALUES (?, ?, ?)',
      [user.id, ipAddress, userAgent]
    );

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        restaurant_id: user.restaurant_id
      },
      config.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Google authentication successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        restaurant_id: user.restaurant_id,
        profilePicture: user.profile_picture,
        loginCount: user.login_count + 1
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all users (admin only)
router.get('/users', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const users = await db.query(`
      SELECT 
        id, username, email, first_name, last_name, role, restaurant_id, 
        login_count, last_login, is_active, created_at,
        (SELECT COUNT(*) FROM user_login_history WHERE user_id = users.id) as total_logins
      FROM users 
      ORDER BY created_at DESC
    `);

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user login history (admin only)
router.get('/users/:id/history', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const history = await db.query(
      'SELECT * FROM user_login_history WHERE user_id = ? ORDER BY login_time DESC LIMIT 50',
      [id]
    );

    res.json({ history });
  } catch (error) {
    console.error('Get user history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
