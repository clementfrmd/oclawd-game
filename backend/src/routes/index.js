const express = require('express');
const router = express.Router();

const stationRoutes = require('./stationRoutes');
const resourceRoutes = require('./resourceRoutes');
const marketplaceRoutes = require('./marketplaceRoutes');
const fleetRoutes = require('./fleetRoutes');
const contractRoutes = require('./contractRoutes');
const authRoutes = require('./authRoutes');

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

// Also mount under v1 for versioned access
router.use(`${API_V1}/stations`, stationRoutes);
router.use(`${API_V1}/resources`, resourceRoutes);
router.use(`${API_V1}/marketplace`, marketplaceRoutes);
router.use(`${API_V1}/fleets`, fleetRoutes);
router.use(`${API_V1}/contracts`, contractRoutes);

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
