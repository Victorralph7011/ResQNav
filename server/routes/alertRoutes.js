const express = require('express');
const router = express.Router();

// POST /api/alerts — dispatch alert to emergency services
router.post('/', (req, res) => {
  const { incidentId, services, location, message } = req.body;

  if (!incidentId || !services || !location) {
    return res.status(400).json({ error: 'incidentId, services, and location are required' });
  }

  // Simulate dispatching alerts
  const alert = {
    id: Date.now(),
    incidentId,
    services, // e.g. ['hospital', 'fire_station', 'police']
    location,
    message: message || 'Emergency incident reported. Immediate response required.',
    dispatchedAt: new Date().toISOString(),
    status: 'dispatched',
  };

  console.log('Alert dispatched:', alert);
  res.status(201).json({ alert });
});

module.exports = router;
