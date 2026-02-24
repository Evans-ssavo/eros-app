const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET all incidents
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM incidents ORDER BY reported_at DESC LIMIT 100'
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST new incident
router.post('/', async (req, res) => {
  const { type, priority, location, description, latitude, longitude, map_x, map_y } = req.body;
  if (!type || !priority || !location) {
    return res.status(400).json({ success: false, error: 'type, priority and location are required' });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO incidents (type, priority, location, description, latitude, longitude, map_x, map_y)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [type, priority, location, description || null, latitude || null, longitude || null,
       map_x || (10 + Math.random() * 80), map_y || (10 + Math.random() * 80)]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH resolve incident
router.patch('/:id/resolve', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE incidents SET status='resolved', resolved_at=NOW()
       WHERE id=$1 RETURNING *`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE incident
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM incidents WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET stats summary
router.get('/stats/summary', async (req, res) => {
  try {
    const total = await pool.query("SELECT COUNT(*) FROM incidents WHERE status='active'");
    const critical = await pool.query("SELECT COUNT(*) FROM incidents WHERE priority='critical' AND status='active'");
    const medium = await pool.query("SELECT COUNT(*) FROM incidents WHERE priority='medium' AND status='active'");
    const low = await pool.query("SELECT COUNT(*) FROM incidents WHERE priority='low' AND status='active'");
    const sosCount = await pool.query("SELECT COUNT(*) FROM sos_alerts WHERE triggered_at > NOW() - INTERVAL '24 hours'");
    const reportCount = await pool.query("SELECT COUNT(*) FROM anonymous_reports WHERE submitted_at > NOW() - INTERVAL '24 hours'");

    res.json({
      success: true,
      data: {
        active: parseInt(total.rows[0].count),
        critical: parseInt(critical.rows[0].count),
        medium: parseInt(medium.rows[0].count),
        low: parseInt(low.rows[0].count),
        sos_today: parseInt(sosCount.rows[0].count),
        reports_today: parseInt(reportCount.rows[0].count),
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
