// server.js
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
const PORT = 4000;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors());
app.use(express.json());

// --- Authentication Middleware ---
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(403).send('A token is required for authentication');
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;// Add this block back to server.js
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!(username && password)) {
      return res.status(400).send('All input is required');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await db.query(
      'INSERT INTO app_users (username, password_hash) VALUES ($1, $2) RETURNING id, username',
      [username, hashedPassword]
    );
    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error registering user');
  }
});
  } catch (err) {
    return res.status(401).send('Invalid Token');
  }
  return next();
};


// Add this block back to server.js
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!(username && password)) {
      return res.status(400).send('All input is required');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await db.query(
      'INSERT INTO app_users (username, password_hash) VALUES ($1, $2) RETURNING id, username',
      [username, hashedPassword]
    );
    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error registering user');
  }
});

// --- Authentication Routes ---
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!(username && password)) {
      return res.status(400).send('All input is required');
    }
    const result = await db.query('SELECT * FROM app_users WHERE username = $1', [username]);
    const user = result.rows[0];
    if (user && (await bcrypt.compare(password, user.password_hash))) {
      const token = jwt.sign({ user_id: user.id, username }, JWT_SECRET, { expiresIn: '8h' });
      return res.status(200).json({ token });
    }
    res.status(400).send('Invalid Credentials');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// --- PROTECTED Farmer API Routes (User-Specific) ---

// Get all farmers for the logged-in user
app.get('/api/farmers', verifyToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const result = await db.query('SELECT * FROM farmers WHERE user_id = $1 ORDER BY id ASC', [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Create a new farmer linked to the logged-in user
app.post('/api/farmers', verifyToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { name, mobile, village } = req.body;
    const newFarmer = await db.query(
      'INSERT INTO farmers (name, mobile, village, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, mobile, village, userId]
    );
    res.status(201).json(newFarmer.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get a single farmer, ensuring it belongs to the logged-in user
app.get('/api/farmers/:id', verifyToken, async (req, res) => {
    try {
      const userId = req.user.user_id;
      const farmerId = req.params.id;
      const result = await db.query('SELECT * FROM farmers WHERE id = $1 AND user_id = $2', [farmerId, userId]);
      if (result.rows.length === 0) {
        return res.status(404).send('Farmer not found or access denied');
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
});

// Update a farmer, ensuring it belongs to the logged-in user
app.put('/api/farmers/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const farmerId = req.params.id;
    const { name, mobile, village } = req.body;

    const updatedFarmer = await db.query(
      'UPDATE farmers SET name = $1, mobile = $2, village = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
      [name, mobile, village, farmerId, userId]
    );

    if (updatedFarmer.rowCount === 0) {
      return res.status(404).send('Farmer not found or access denied');
    }
    res.json(updatedFarmer.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Delete a farmer, ensuring it belongs to the logged-in user
app.delete('/api/farmers/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const farmerId = req.params.id;

    const farmerCheck = await db.query('SELECT * FROM farmers WHERE id = $1 AND user_id = $2', [farmerId, userId]);
    if (farmerCheck.rowCount === 0) {
      return res.status(403).send('Access denied. You do not own this farmer.');
    }

    await db.query('DELETE FROM transactions WHERE farmer_id = $1', [farmerId]);
    await db.query('DELETE FROM farmers WHERE id = $1', [farmerId]);

    res.status(200).send(`Farmer with ID ${farmerId} deleted successfully.`);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


// --- PROTECTED Transaction API Routes (User-Specific) ---

// Middleware to check if a user owns the farmer for a transaction
const verifyFarmerOwnership = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const farmerId = req.params.farmerId;
    const farmerCheck = await db.query('SELECT * FROM farmers WHERE id = $1 AND user_id = $2', [farmerId, userId]);
    if (farmerCheck.rowCount === 0) {
      return res.status(403).send('Access denied to this farmer\'s transactions.');
    }
    next();
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get transactions for a specific farmer (ownership is checked by middleware)
app.get('/api/farmers/:farmerId/transactions', verifyToken, verifyFarmerOwnership, async (req, res) => {
  try {
    const { farmerId } = req.params;
    const result = await db.query("SELECT *, to_char(date, 'YYYY-MM-DD') as date FROM transactions WHERE farmer_id = $1 ORDER BY transactions.date ASC", [farmerId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Add a transaction for a specific farmer (ownership is checked by middleware)
app.post('/api/farmers/:farmerId/transactions', verifyToken, verifyFarmerOwnership, async (req, res) => {
    try {
        const { farmerId } = req.params;
        const { type, item, amount } = req.body;
        const date = new Date();
        const newTransaction = await db.query(
            'INSERT INTO transactions (farmer_id, type, item, amount, date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [farmerId, type, item, amount, date]
        );
        const response = newTransaction.rows[0];
        response.date = response.date.toISOString().slice(0, 10);
        res.status(201).json(response);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


// --- PROTECTED Dashboard Routes (User-Specific) ---

app.get('/api/dashboard-summary', verifyToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const totalsQuery = `
      SELECT
        COALESCE(SUM(CASE WHEN t.type = 'Lent' THEN t.amount ELSE 0 END), 0) AS total_lent,
        COALESCE(SUM(CASE WHEN t.type = 'Received' THEN t.amount ELSE 0 END), 0) AS total_received
      FROM transactions t JOIN farmers f ON t.farmer_id = f.id
      WHERE f.user_id = $1;
    `;
    const farmerCountQuery = 'SELECT COUNT(*) AS farmer_count FROM farmers WHERE user_id = $1;';

    const totalsResult = await db.query(totalsQuery, [userId]);
    const farmerCountResult = await db.query(farmerCountQuery, [userId]);
    
    const summary = {
      totalLent: parseFloat(totalsResult.rows[0].total_lent),
      totalReceived: parseFloat(totalsResult.rows[0].total_received),
      farmerCount: parseInt(farmerCountResult.rows[0].farmer_count, 10),
    };

    res.json(summary);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server is running successfully on http://localhost:${PORT}`);
});