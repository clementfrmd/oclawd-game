const express = require('express');
const router = express.Router();
const playerResourceController = require('../controllers/playerResourceController');

// GET /api/player/:address/resources - Get player resources
router.get('/:address/resources', playerResourceController.getPlayerResources);

// GET /api/player/:address/dashboard - Get combined dashboard data
router.get('/:address/dashboard', playerResourceController.getDashboard);

// POST /api/player/init - Initialize a new player
router.post('/init', playerResourceController.initializePlayer);

// POST /api/player/add-resources - Add resources (testing/admin)
router.post('/add-resources', playerResourceController.addResources);

module.exports = router;
