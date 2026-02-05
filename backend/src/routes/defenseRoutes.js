const express = require('express');
const router = express.Router();
const defenseController = require('../controllers/defenseController');

// GET /api/defense/:address - Get player defenses
router.get('/:address', defenseController.getPlayerDefenses);

// POST /api/defense/build - Build defense units
router.post('/build', defenseController.buildDefense);

// POST /api/defense/cancel - Cancel defense build
router.post('/cancel', defenseController.cancelBuild);

module.exports = router;
