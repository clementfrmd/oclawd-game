const crypto = require('crypto');

module.exports = (sequelize, DataTypes) => {
  const Agent = sequelize.define('Agent', {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      defaultValue: () => `agent_${crypto.randomBytes(8).toString('hex')}`
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        len: [3, 50]
      }
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    contactEmail: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: true
      },
      field: 'contact_email'
    },
    webhookUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: true
      },
      field: 'webhook_url'
    },
    apiKeyHash: {
      type: DataTypes.STRING(64),
      allowNull: false,
      field: 'api_key_hash'
    },
    apiKeyPrefix: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'api_key_prefix'
    },
    stationId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'station_id',
      references: {
        model: 'stations',
        key: 'id'
      }
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    rateLimitMultiplier: {
      type: DataTypes.FLOAT,
      defaultValue: 2.0,
      field: 'rate_limit_multiplier'
    },
    totalRequests: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
      field: 'total_requests'
    },
    lastRequestAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_request_at'
    }
  }, {
    tableName: 'agents',
    timestamps: true,
    underscored: true
  });

  // Generate a new API key
  Agent.generateApiKey = function() {
    const key = `void_sk_live_${crypto.randomBytes(24).toString('hex')}`;
    const prefix = key.substring(0, 20);
    const hash = crypto.createHash('sha256').update(key).digest('hex');
    return { key, prefix, hash };
  };

  // Verify an API key against stored hash
  Agent.prototype.verifyApiKey = function(apiKey) {
    const hash = crypto.createHash('sha256').update(apiKey).digest('hex');
    return hash === this.apiKeyHash;
  };

  // Increment request count
  Agent.prototype.recordRequest = async function() {
    this.totalRequests = (this.totalRequests || 0) + 1;
    this.lastRequestAt = new Date();
    await this.save({ fields: ['totalRequests', 'lastRequestAt'] });
  };

  return Agent;
};
