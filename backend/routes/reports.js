const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// POST submit anonymous report
router.post('/', async (req, res) => {
  const { incident_type, severity, location, incident_time, description } = req.body;
  if (!incident_type || !severity || !location || !description) {
    return res.status(400).json({ success: false, error: 'incident_type, severity, location and description are required' });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO anonymous_reports (incident_type, severity, location, incident_time, description)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, submitted_at`,
      [incident_type, severity, location, incident_time || null, description]
    );
    res.status(201).json({
      success: true,
      data: {
        reference_id: 'RPT-' + rows[0].id.split('-')[0].toUpperCase(),
        submitted_at: rows[0].submitted_at
      },
      message: 'Report submitted anonymously. Thank you.'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET all reports (admin view)
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, incident_type, severity, location, incident_time, status, submitted_at FROM anonymous_reports ORDER BY submitted_at DESC LIMIT 100'
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH update report status
router.patch('/:id/status', async (req, res) => {
  const { status } = req.body;
  if (!['pending', 'reviewed', 'resolved'].includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid status' });
  }
  try {
    const { rows } = await pool.query(
      'UPDATE anonymous_reports SET status=$1 WHERE id=$2 RETURNING *',
      [status, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
