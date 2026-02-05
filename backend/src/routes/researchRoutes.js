const express = require('express');
const router = express.Router();
const researchController = require('../controllers/researchController');

// GET /api/research/:address - Get player research levels
router.get('/:address', researchController.getPlayerResearch);

// POST /api/research/start - Start researching a technology
router.post('/start', researchController.startResearch);

// POST /api/research/cancel - Cancel research
router.post('/cancel', researchController.cancelResearch);

module.exports = router;
