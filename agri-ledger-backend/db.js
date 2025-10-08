// db.js
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: 5432,
  ssl: true, // Required for connecting to Supabase
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};