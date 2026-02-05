const express = require('express');
const router = express.Router();

const stationRoutes = require('./stationRoutes');
const resourceRoutes = require('./resourceRoutes');
const marketplaceRoutes = require('./marketplaceRoutes');
const fleetRoutes = require('./fleetRoutes');
const contractRoutes = require('./contractRoutes');
const authRoutes = require('./authRoutes');
const facilityRoutes = require('./facilityRoutes');
const researchRoutes = require('./researchRoutes');
const defenseRoutes = require('./defenseRoutes');
const playerResourceRoutes = require('./playerResourceRoutes');

// API version prefix
const API_V1 = '/v1';

// Auth routes (agent registration, API key management)
router.use(`${API_V1}/auth`, authRoutes);

// Game routes
router.use('/stations', stationRoutes);
router.use('/resources', resourceRoutes);
router.use('/marketplace', marketplaceRoutes);
router.use('/fleets', fleetRoutes);
router.use('/contracts', contractRoutes);

// New game mechanics routes
router.use('/facilities', facilityRoutes);
router.use('/research', researchRoutes);
router.use('/defense', defenseRoutes);
router.use('/player', playerResourceRoutes);

// Also mount under v1 for versioned access
router.use(`${API_V1}/stations`, stationRoutes);
router.use(`${API_V1}/resources`, resourceRoutes);
router.use(`${API_V1}/marketplace`, marketplaceRoutes);
router.use(`${API_V1}/fleets`, fleetRoutes);
router.use(`${API_V1}/contracts`, contractRoutes);
router.use(`${API_V1}/facilities`, facilityRoutes);
router.use(`${API_V1}/research`, researchRoutes);
router.use(`${API_V1}/defense`, defenseRoutes);
router.use(`${API_V1}/player`, playerResourceRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Void Conquest API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

router.get(`${API_V1}/health`, (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Void Conquest API v1 is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
