import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// In production (Render, Railway, Neon, etc.) a single DATABASE_URL connection
// string is provided — managed Postgres requires SSL. Locally we fall back to
// the individual DB_* variables from .env with no SSL.
const connectionString = process.env.DATABASE_URL;

export const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'lifedesk_db',
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT || '5432', 10),
    });

// Helper query function
export const query = (text, params) => pool.query(text, params);