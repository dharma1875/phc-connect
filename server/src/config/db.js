const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'phc_connect',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: false,
});

async function testConnection() {
  try {
    const [rows] = await pool.query('SELECT 1 AS connection_check');
    console.log('Database connection successful.');
    return rows[0].connection_check === 1;
  } catch (error) {
    console.warn('Database connection failed. Please ensure MySQL is running and .env values are correct.');
    console.warn(error.message);
    return false;
  }
}

module.exports = {
  pool,
  testConnection,
};
