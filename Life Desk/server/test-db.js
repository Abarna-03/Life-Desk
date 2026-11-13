import { pool } from './src/config/db.js';

async function testConnection() {
  try {
    const res = await pool.query('SELECT current_database(), current_user, NOW()');
    console.log('✅ Connected successfully to PostgreSQL!');
    console.log('Database:', res.rows[0].current_database);
    console.log('User:', res.rows[0].current_user);
    console.log('Server Time:', res.rows[0].now);
    process.exit(0);
  } catch (err) {
    console.error('❌ Connection error:', err); // Shows code, host, port & reason
    process.exit(1);
  }
}

testConnection();