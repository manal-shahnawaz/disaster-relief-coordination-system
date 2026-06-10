const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initPool } = require('./db');
const { logEvent } = require('./logger');

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes
app.use('/api/disasters',   require('./routes/disasters'));
app.use('/api/persons',     require('./routes/persons'));
app.use('/api/victims',     require('./routes/victims'));
app.use('/api/volunteers',  require('./routes/volunteers'));
app.use('/api/shelters',    require('./routes/shelters'));
app.use('/api/supplies',    require('./routes/supplies'));
app.use('/api/hubs',        require('./routes/hubs'));
app.use('/api/orgs',        require('./routes/orgs'));
app.use('/api/donors',      require('./routes/donors'));
app.use('/api/donations',   require('./routes/donations'));
app.use('/api/stats',       require('./routes/stats'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', db: 'Oracle XE' }));

// Catch-all → frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 5000;

initPool()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      logEvent('START', { port: PORT, node: process.version });
    });
  })
  .catch(err => {
    console.error('❌ Failed to init Oracle pool:', err.message);
    process.exit(1);
  });
