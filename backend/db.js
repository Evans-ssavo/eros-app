const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const initDB = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS incidents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type VARCHAR(100) NOT NULL,
        priority VARCHAR(20) NOT NULL CHECK (priority IN ('critical', 'medium', 'low')),
        location VARCHAR(255) NOT NULL,
        description TEXT,
        latitude DECIMAL(10, 7),
        longitude DECIMAL(10, 7),
        map_x DECIMAL(5, 2),
        map_y DECIMAL(5, 2),
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'pending')),
        reported_at TIMESTAMPTZ DEFAULT NOW(),
        resolved_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS sos_alerts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        latitude DECIMAL(10, 7),
        longitude DECIMAL(10, 7),
        address TEXT,
        status VARCHAR(20) DEFAULT 'dispatched',
        triggered_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS anonymous_reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        incident_type VARCHAR(100) NOT NULL,
        severity VARCHAR(20) NOT NULL,
        location VARCHAR(255) NOT NULL,
        incident_time TIMESTAMPTZ,
        description TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        submitted_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ Database tables initialized');
  } catch (err) {
    console.error('❌ DB init error:', err.message);
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { pool, initDB };
