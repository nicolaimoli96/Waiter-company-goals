const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get recommendations (existing functionality)
router.post('/categories', authenticateToken, async (req, res) => {
  try {
    const { day, session, weather, waiter } = req.body;

    // Mock recommendations for now - you can replace this with your existing logic
    const mockRecommendations = [
      {
        category: 'Pizza',
        predicted_quantity: Math.floor(Math.random() * 20) + 10,
        target_quantity: Math.floor(Math.random() * 15) + 15
      },
      {
        category: 'Pasta',
        predicted_quantity: Math.floor(Math.random() * 15) + 8,
        target_quantity: Math.floor(Math.random() * 12) + 10
      },
      {
        category: 'Salad',
        predicted_quantity: Math.floor(Math.random() * 10) + 5,
        target_quantity: Math.floor(Math.random() * 8) + 7
      }
    ];

    res.json({ recommendations: mockRecommendations });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
