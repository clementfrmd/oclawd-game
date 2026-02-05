module.exports = (sequelize, DataTypes) => {
  const PlayerFacility = sequelize.define('PlayerFacility', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    playerAddress: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'player_address'
    },
    facilityType: {
      type: DataTypes.ENUM([
        'metal_mine',
        'crystal_refinery', 
        'deuterium_synthesizer',
        'solar_plant',
        'fusion_reactor',
        'robotics_factory',
        'shipyard',
        'research_lab',
        'missile_silo',
        'nanite_factory'
      ]),
      allowNull: false,
      field: 'facility_type'
    },
    level: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    upgradeStartedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'upgrade_started_at'
    },
    upgradeCompletesAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'upgrade_completes_at'
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'player_facilities',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['player_address', 'facility_type']
      },
      {
        fields: ['player_address']
      }
    ]
  });

  // Calculate production rate per hour based on level
  PlayerFacility.prototype.getProductionRate = function() {
    const baseRates = {
      metal_mine: { metal: 30 },
      crystal_refinery: { crystal: 20 },
      deuterium_synthesizer: { deuterium: 10 },
      solar_plant: { energy: 20 },
      fusion_reactor: { energy: 50, deuterium: -10 }
    };

    const base = baseRates[this.facilityType];
    if (!base) return {};

    const multiplier = Math.pow(1.1, this.level);
    const production = {};
    
    for (const [resource, rate] of Object.entries(base)) {
      production[resource] = Math.floor(rate * this.level * multiplier);
    }
    
    return production;
  };

  // Calculate upgrade cost
  PlayerFacility.getUpgradeCost = function(facilityType, currentLevel) {
    const baseCosts = {
      metal_mine: { metal: 60, crystal: 15 },
      crystal_refinery: { metal: 48, crystal: 24 },
      deuterium_synthesizer: { metal: 225, crystal: 75 },
      solar_plant: { metal: 75, crystal: 30 },
      fusion_reactor: { metal: 900, crystal: 360, deuterium: 180 },
      robotics_factory: { metal: 400, crystal: 120, deuterium: 200 },
      shipyard: { metal: 400, crystal: 200, deuterium: 100 },
      research_lab: { metal: 200, crystal: 400, deuterium: 200 },
      missile_silo: { metal: 20000, crystal: 20000, deuterium: 1000 },
      nanite_factory: { metal: 1000000, crystal: 500000, deuterium: 100000 }
    };

    const base = baseCosts[facilityType] || { metal: 100, crystal: 50 };
    const multiplier = Math.pow(1.5, currentLevel);
    
    const cost = {};
    for (const [resource, amount] of Object.entries(base)) {
      cost[resource] = Math.floor(amount * multiplier);
    }
    
    return cost;
  };

  // Calculate upgrade time in seconds
  PlayerFacility.getUpgradeTime = function(facilityType, currentLevel, roboticsLevel = 0, naniteLevel = 0) {
    const baseTimes = {
      metal_mine: 60,
      crystal_refinery: 90,
      deuterium_synthesizer: 120,
      solar_plant: 60,
      fusion_reactor: 300,
      robotics_factory: 180,
      shipyard: 240,
      research_lab: 200,
      missile_silo: 600,
      nanite_factory: 1800
    };

    const baseTime = baseTimes[facilityType] || 120;
    const levelMultiplier = Math.pow(1.4, currentLevel);
    const roboticsReduction = 1 / (1 + roboticsLevel);
    const naniteReduction = Math.pow(0.5, naniteLevel);
    
    return Math.floor(baseTime * levelMultiplier * roboticsReduction * naniteReduction);
  };

  return PlayerFacility;
};
