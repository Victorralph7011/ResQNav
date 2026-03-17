const express = require('express');
const axios = require('axios');
const router = express.Router();

// GET /api/weather?lat=...&lon=... — proxy to OpenWeather API
router.get('/', async (req, res) => {
  const { lat, lon } = req.query;
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'lat and lon query params are required' });
  }

  if (!apiKey || apiKey === 'your_openweather_api_key_here') {
    return res.json({
      weather: 'API key not configured',
      note: 'Add your OpenWeather API key to server/.env',
    });
  }

  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    res.json(response.data);
  } catch (err) {
    console.error('Weather API error:', err.message);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

module.exports = router;
