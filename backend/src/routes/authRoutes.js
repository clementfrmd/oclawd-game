const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth, agentAuth } = require('../middleware/auth');

// Register a new AI agent
// POST /api/v1/auth/register-agent
router.post('/register-agent', authController.registerAgent);

// Generate a new API key (invalidates old one)
// GET /api/v1/auth/apikey
// Requires: Authorization header with current API key, X-Agent-ID header
router.get('/apikey', agentAuth, authController.regenerateApiKey);

// Get agent info
// GET /api/v1/auth/agent
router.get('/agent', agentAuth, authController.getAgentInfo);

// Deactivate agent
// DELETE /api/v1/auth/agent
router.delete('/agent', agentAuth, authController.deactivateAgent);

module.exports = router;
