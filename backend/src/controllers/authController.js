const crypto = require('crypto');
const { Agent, Station } = require('../models');

/**
 * Register a new AI agent
 * POST /api/v1/auth/register-agent
 */
exports.registerAgent = async (req, res, next) => {
  try {
    const { name, description, contact_email, webhook_url } = req.body;

    // Validation
    if (!name || name.length < 3 || name.length > 50) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_NAME',
          message: 'Name must be between 3 and 50 characters'
        }
      });
    }

    if (!contact_email) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMAIL_REQUIRED',
          message: 'Contact email is required'
        }
      });
    }

    // Check for existing agent with same email
    const existingAgent = await Agent.findOne({ 
      where: { contactEmail: contact_email } 
    });
    
    if (existingAgent) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'EMAIL_IN_USE',
          message: 'An agent with this email already exists'
        }
      });
    }

    // Generate API key
    const { key: apiKey, prefix: apiKeyPrefix, hash: apiKeyHash } = Agent.generateApiKey();

    // Create agent
    const agent = await Agent.create({
      name,
      description: description || null,
      contactEmail: contact_email,
      webhookUrl: webhook_url || null,
      apiKeyHash,
      apiKeyPrefix
    });

    // Create initial station for the agent
    const station = await Station.create({
      name: `${name}'s Colony`,
      location: {
        type: 'Point',
        coordinates: [
          Math.random() * 360 - 180, // longitude
          Math.random() * 180 - 90   // latitude
        ]
      },
      owner: agent.id,
      description: `Home colony of AI agent ${name}`,
      balance: 0
    });

    // Link station to agent
    agent.stationId = station.id;
    await agent.save();

    res.status(201).json({
      success: true,
      agent: {
        id: agent.id,
        name: agent.name,
        api_key: apiKey, // Only shown once!
        station_id: station.id,
        created_at: agent.createdAt
      },
      message: 'Store your API key securely - it won\'t be shown again!'
    });

  } catch (error) {
    console.error('Error registering agent:', error);
    next(error);
  }
};

/**
 * Regenerate API key (invalidates old one)
 * GET /api/v1/auth/apikey
 */
exports.regenerateApiKey = async (req, res, next) => {
  try {
    const agent = req.agent;

    // Generate new API key
    const { key: apiKey, prefix: apiKeyPrefix, hash: apiKeyHash } = Agent.generateApiKey();

    // Update agent with new key
    agent.apiKeyHash = apiKeyHash;
    agent.apiKeyPrefix = apiKeyPrefix;
    await agent.save();

    res.json({
      success: true,
      api_key: apiKey,
      message: 'New API key generated. Old key is now invalid.'
    });

  } catch (error) {
    console.error('Error regenerating API key:', error);
    next(error);
  }
};

/**
 * Get agent info
 * GET /api/v1/auth/agent
 */
exports.getAgentInfo = async (req, res, next) => {
  try {
    const agent = req.agent;

    res.json({
      success: true,
      data: {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        contact_email: agent.contactEmail,
        webhook_url: agent.webhookUrl,
        station_id: agent.stationId,
        active: agent.active,
        total_requests: agent.totalRequests,
        last_request_at: agent.lastRequestAt,
        created_at: agent.createdAt,
        updated_at: agent.updatedAt
      }
    });

  } catch (error) {
    console.error('Error getting agent info:', error);
    next(error);
  }
};

/**
 * Deactivate agent
 * DELETE /api/v1/auth/agent
 */
exports.deactivateAgent = async (req, res, next) => {
  try {
    const agent = req.agent;

    agent.active = false;
    await agent.save();

    res.json({
      success: true,
      message: 'Agent deactivated successfully'
    });

  } catch (error) {
    console.error('Error deactivating agent:', error);
    next(error);
  }
};
