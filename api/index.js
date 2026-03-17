const express = require('express');
const cors = require('cors');

// Load env vars (Vercel provides them automatically, but dotenv is a safe fallback)
require('dotenv').config();

const incidentRoutes = require('../server/routes/incidentRoutes');
const alertRoutes = require('../server/routes/alertRoutes');
const weatherRoutes = require('../server/routes/weatherRoutes');
const chatRoutes = require('../server/routes/chatRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/incidents', incidentRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/chat', chatRoutes);

// Export for Vercel Serverless Functions
module.exports = app;
