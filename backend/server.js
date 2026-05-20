require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
app.use('/uploads', express.static(uploadsDir));

// Initialize JSON database
require('./database');

// Routes
app.use('/api/scans',    require('./routes/scans'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/reports',  require('./routes/reports'));

// Health check
app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', message: 'X-Ray Detection API Running', db: 'JSON File' })
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 Database: JSON File (no installation needed)`);
});
