const express = require('express');
const db = require('../database/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get active competition
router.get('/active', async (req, res) => {
  try {
    const competition = await db.get(
      'SELECT * FROM competitions WHERE is_active = 1 ORDER BY created_at DESC LIMIT 1'
    );

    if (!competition) {
      return res.json({ competition: null });
    }

    res.json({ competition });
  } catch (error) {
    console.error('Get active competition error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all competitions (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const competitions = await db.query(
      'SELECT * FROM competitions ORDER BY created_at DESC'
    );

    res.json({ competitions });
  } catch (error) {
    console.error('Get competitions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new competition (admin only)
router.post('/start', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { item, targetQuantity, prize, description } = req.body;

    if (!item || !targetQuantity || !prize || !description) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Deactivate any existing active competition
    await db.run('UPDATE competitions SET is_active = 0 WHERE is_active = 1');

    // Create new competition
    const result = await db.run(
      'INSERT INTO competitions (item, target_quantity, prize, description, is_active, created_by) VALUES (?, ?, ?, ?, 1, ?)',
      [item, targetQuantity, prize, description, req.user.id]
    );

    const competition = await db.get(
      'SELECT * FROM competitions WHERE id = ?',
      [result.id]
    );

    res.status(201).json({
      message: 'Competition started successfully',
      competition
    });
  } catch (error) {
    console.error('Start competition error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Stop active competition (admin only)
router.post('/stop', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await db.run('UPDATE competitions SET is_active = 0 WHERE is_active = 1');

    if (result.changes === 0) {
      return res.status(404).json({ error: 'No active competition found' });
    }

    res.json({ message: 'Competition stopped successfully' });
  } catch (error) {
    console.error('Stop competition error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Participate in competition
router.post('/participate', authenticateToken, async (req, res) => {
  try {
    const { participate } = req.body;

    // Get active competition
    const competition = await db.get(
      'SELECT * FROM competitions WHERE is_active = 1 ORDER BY created_at DESC LIMIT 1'
    );

    if (!competition) {
      return res.status(404).json({ error: 'No active competition found' });
    }

    // Check if participation record exists
    const existingParticipation = await db.get(
      'SELECT * FROM competition_participation WHERE competition_id = ? AND user_id = ?',
      [competition.id, req.user.id]
    );

    if (existingParticipation) {
      // Update existing participation
      await db.run(
        'UPDATE competition_participation SET is_participating = ?, updated_at = CURRENT_TIMESTAMP WHERE competition_id = ? AND user_id = ?',
        [participate, competition.id, req.user.id]
      );
    } else {
      // Create new participation record
      await db.run(
        'INSERT INTO competition_participation (competition_id, user_id, is_participating) VALUES (?, ?, ?)',
        [competition.id, req.user.id, participate]
      );
    }

    res.json({
      message: participate ? 'Successfully joined competition' : 'Successfully left competition',
      participating: participate
    });
  } catch (error) {
    console.error('Participation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update competition progress
router.put('/progress', authenticateToken, async (req, res) => {
  try {
    const { actualQuantity } = req.body;

    if (typeof actualQuantity !== 'number' || actualQuantity < 0) {
      return res.status(400).json({ error: 'Valid actual quantity is required' });
    }

    // Get active competition
    const competition = await db.get(
      'SELECT * FROM competitions WHERE is_active = 1 ORDER BY created_at DESC LIMIT 1'
    );

    if (!competition) {
      return res.status(404).json({ error: 'No active competition found' });
    }

    // Check if user is participating
    const participation = await db.get(
      'SELECT * FROM competition_participation WHERE competition_id = ? AND user_id = ? AND is_participating = 1',
      [competition.id, req.user.id]
    );

    if (!participation) {
      return res.status(400).json({ error: 'You are not participating in this competition' });
    }

    // Update progress
    await db.run(
      'UPDATE competition_participation SET actual_quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE competition_id = ? AND user_id = ?',
      [actualQuantity, competition.id, req.user.id]
    );

    res.json({
      message: 'Progress updated successfully',
      actualQuantity,
      targetQuantity: competition.target_quantity,
      progress: Math.min((actualQuantity / competition.target_quantity) * 100, 100)
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's competition status
router.get('/status', authenticateToken, async (req, res) => {
  try {
    // Get active competition
    const competition = await db.get(
      'SELECT * FROM competitions WHERE is_active = 1 ORDER BY created_at DESC LIMIT 1'
    );

    if (!competition) {
      return res.json({ 
        competition: null, 
        participation: null 
      });
    }

    // Get user's participation status
    const participation = await db.get(
      'SELECT * FROM competition_participation WHERE competition_id = ? AND user_id = ?',
      [competition.id, req.user.id]
    );

    res.json({
      competition,
      participation: participation || { is_participating: false, actual_quantity: 0 }
    });
  } catch (error) {
    console.error('Get competition status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get competition leaderboard (admin only)
router.get('/leaderboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Get active competition
    const competition = await db.get(
      'SELECT * FROM competitions WHERE is_active = 1 ORDER BY created_at DESC LIMIT 1'
    );

    if (!competition) {
      return res.status(404).json({ error: 'No active competition found' });
    }

    // Get leaderboard
    const leaderboard = await db.query(`
      SELECT 
        u.username,
        u.restaurant_id,
        cp.actual_quantity,
        cp.updated_at,
        CASE 
          WHEN cp.actual_quantity >= ? THEN 1 
          ELSE 0 
        END as target_reached
      FROM competition_participation cp
      JOIN users u ON cp.user_id = u.id
      WHERE cp.competition_id = ? AND cp.is_participating = 1
      ORDER BY cp.actual_quantity DESC, cp.updated_at ASC
    `, [competition.target_quantity, competition.id]);

    res.json({
      competition,
      leaderboard
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
