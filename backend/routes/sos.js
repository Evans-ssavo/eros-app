const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// POST trigger SOS
router.post('/', async (req, res) => {
  const { latitude, longitude, address } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO sos_alerts (latitude, longitude, address)
       VALUES ($1, $2, $3) RETURNING *`,
      [latitude || null, longitude || null, address || 'Unknown location']
    );
    // Also create a critical incident automatically
    await pool.query(
      `INSERT INTO incidents (type, priority, location, description, latitude, longitude, map_x, map_y)
       VALUES ('SOS Alert', 'critical', $1, 'Automatic SOS trigger', $2, $3, $4, $5)`,
      [address || 'Unknown location', latitude || null, longitude || null,
       10 + Math.random() * 80, 10 + Math.random() * 80]
    );
    res.status(201).json({ success: true, data: rows[0], message: 'SOS received. Nearest unit dispatched.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET recent SOS alerts
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM sos_alerts ORDER BY triggered_at DESC LIMIT 50'
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
