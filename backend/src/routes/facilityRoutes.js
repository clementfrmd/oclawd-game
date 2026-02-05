const express = require('express');
const router = express.Router();
const facilityController = require('../controllers/facilityController');

// GET /api/facilities/:address - Get player facilities and production rates
router.get('/:address', facilityController.getPlayerFacilities);

// POST /api/facilities/build - Build/upgrade a facility
router.post('/build', facilityController.buildFacility);

// POST /api/facilities/cancel - Cancel an upgrade
router.post('/cancel', facilityController.cancelUpgrade);

module.exports = router;
