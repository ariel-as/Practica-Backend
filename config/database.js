import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

const sslEnabled = String(process.env.DB_SSL).toLowerCase() === 'true';
const sslRejectUnauthorized =
  String(process.env.DB_SSL_REJECT_UNAUTHORIZED).toLowerCase() !== 'false';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: Number(process.env.DB_POOL_MAX || 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: sslEnabled ? { rejectUnauthorized: sslRejectUnauthorized } : false,
});

pool.on('error', (error) => {
  console.error('Error inesperado en el pool de PostgreSQL:', error.message);
});

export async function checkDatabaseConnection() {
  const client = await pool.connect();

  try {
    await client.query('SELECT 1');
  } finally {
    client.release();
  }
}

export async function closePool() {
  await pool.end();
}

export default pool;
