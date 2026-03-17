const express = require('express');
const router = express.Router();

// In-memory store (replace with Firestore in production)
let incidents = [];
let nextId = 1;

// GET /api/incidents — list all incidents
router.get('/', (req, res) => {
  res.json({ incidents });
});

// POST /api/incidents — report a new incident
router.post('/', (req, res) => {
  const { type, location, lat, lng, description, severity, reportedBy } = req.body;

  if (!type || !location) {
    return res.status(400).json({ error: 'Type and location are required' });
  }

  const incident = {
    id: nextId++,
    type,
    location,
    lat: lat || null,
    lng: lng || null,
    description: description || '',
    severity: severity || 'moderate',
    reportedBy: reportedBy || 'anonymous',
    verified: false,
    createdAt: new Date().toISOString(),
  };

  incidents.push(incident);
  res.status(201).json({ incident });
});

// PATCH /api/incidents/:id/verify — verify an incident
router.patch('/:id/verify', (req, res) => {
  const incident = incidents.find(i => i.id === parseInt(req.params.id));
  if (!incident) return res.status(404).json({ error: 'Incident not found' });

  incident.verified = true;
  res.json({ incident });
});

module.exports = router;
