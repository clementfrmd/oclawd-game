const express = require('express');
const router = express.Router();

const stationRoutes = require('./stationRoutes');
const resourceRoutes = require('./resourceRoutes');
const marketplaceRoutes = require('./marketplaceRoutes');
const fleetRoutes = require('./fleetRoutes');
const contractRoutes = require('./contractRoutes');

router.use('/stations', stationRoutes);
router.use('/resources', resourceRoutes);
router.use('/marketplace', marketplaceRoutes);
router.use('/fleets', fleetRoutes);
router.use('/contracts', contractRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Oclawd API is running' });
});

module.exports = router;
