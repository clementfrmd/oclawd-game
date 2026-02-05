const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Station, Agent } = require('../models');

/**
 * Middleware to verify JWT token (for human players)
 */
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No authentication token provided' });
    }

    // Check if it's an API key (starts with void_sk_)
    if (token.startsWith('void_sk_')) {
      return agentAuth(req, res, next);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const station = await Station.findOne({ where: { id: decoded.stationId } });

    if (!station) {
      return res.status(401).json({ error: 'Station not found' });
    }

    if (decoded.stationId !== station.id) {
      return res.status(403).json({ error: 'Invalid token' });
    }

    req.station = station;
    req.isAgent = false;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Invalid authentication token' });
  }
};

/**
 * Middleware to verify API key (for AI agents)
 */
const agentAuth = async (req, res, next) => {
  try {
    const apiKey = req.header('Authorization')?.replace('Bearer ', '');
    const agentId = req.header('X-Agent-ID');

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_API_KEY',
          message: 'No API key provided. Include Authorization: Bearer <api_key>'
        }
      });
    }

    if (!apiKey.startsWith('void_sk_')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_API_KEY_FORMAT',
          message: 'Invalid API key format. Keys start with void_sk_'
        }
      });
    }

    // Find agent by key prefix for efficiency
    const keyPrefix = apiKey.substring(0, 20);
    const agent = await Agent.findOne({ 
      where: { apiKeyPrefix: keyPrefix, active: true } 
    });

    if (!agent) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_API_KEY',
          message: 'Invalid or expired API key'
        }
      });
    }

    // Verify full key hash
    if (!agent.verifyApiKey(apiKey)) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_API_KEY',
          message: 'Invalid or expired API key'
        }
      });
    }

    // Verify agent ID if provided
    if (agentId && agentId !== agent.id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'AGENT_ID_MISMATCH',
          message: 'X-Agent-ID does not match the API key owner'
        }
      });
    }

    // Get associated station
    let station = null;
    if (agent.stationId) {
      station = await Station.findOne({ where: { id: agent.stationId } });
    }

    // Record the request (async, don't wait)
    agent.recordRequest().catch(err => 
      console.error('Error recording agent request:', err)
    );

    req.agent = agent;
    req.station = station;
    req.isAgent = true;
    req.rateLimitMultiplier = agent.rateLimitMultiplier || 2.0;

    next();
  } catch (error) {
    console.error('Agent auth error:', error);
    res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: 'Authentication failed'
      }
    });
  }
};

/**
 * Middleware that allows both JWT and API key auth
 */
const flexAuth = async (req, res, next) => {
  const authHeader = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!authHeader) {
    return res.status(401).json({ error: 'No authentication provided' });
  }

  // Route to appropriate auth based on token format
  if (authHeader.startsWith('void_sk_')) {
    return agentAuth(req, res, next);
  } else {
    return auth(req, res, next);
  }
};

/**
 * Optional auth - proceeds even without auth but sets req.station/req.agent if present
 */
const optionalAuth = async (req, res, next) => {
  const authHeader = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!authHeader) {
    req.isAuthenticated = false;
    return next();
  }

  try {
    if (authHeader.startsWith('void_sk_')) {
      // Try agent auth
      const keyPrefix = authHeader.substring(0, 20);
      const agent = await Agent.findOne({ 
        where: { apiKeyPrefix: keyPrefix, active: true } 
      });
      
      if (agent && agent.verifyApiKey(authHeader)) {
        req.agent = agent;
        req.isAgent = true;
        req.isAuthenticated = true;
        if (agent.stationId) {
          req.station = await Station.findOne({ where: { id: agent.stationId } });
        }
      }
    } else {
      // Try JWT auth
      const decoded = jwt.verify(authHeader, process.env.JWT_SECRET);
      const station = await Station.findOne({ where: { id: decoded.stationId } });
      if (station) {
        req.station = station;
        req.isAgent = false;
        req.isAuthenticated = true;
      }
    }
  } catch (error) {
    // Auth failed but that's ok for optional auth
  }

  req.isAuthenticated = req.isAuthenticated || false;
  next();
};

module.exports = { auth, agentAuth, flexAuth, optionalAuth };
