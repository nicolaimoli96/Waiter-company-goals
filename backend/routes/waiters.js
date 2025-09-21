const express = require('express');
const db = require('../database/db');

const router = express.Router();

// Get all waiters
router.get('/', async (req, res) => {
  try {
    const waiters = await db.query('SELECT name FROM waiters ORDER BY name');
    res.json({ waiters: waiters.map(w => w.name) });
  } catch (error) {
    console.error('Get waiters error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add new waiter
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Waiter name is required' });
    }

    const result = await db.run(
      'INSERT INTO waiters (name) VALUES (?)',
      [name]
    );

    res.status(201).json({
      message: 'Waiter added successfully',
      waiter: { id: result.id, name }
    });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Waiter name already exists' });
    }
    console.error('Add waiter error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
