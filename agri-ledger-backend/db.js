// db.js
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'agri_ledger_db',
  password: 'azsxdcfv12', // <-- EDIT THIS LINE
  port: 5432,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};