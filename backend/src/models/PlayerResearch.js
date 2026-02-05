module.exports = (sequelize, DataTypes) => {
  const PlayerResearch = sequelize.define('PlayerResearch', {
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
    technologyType: {
      type: DataTypes.ENUM([
        'energy_tech',
        'laser_tech',
        'ion_tech',
        'hyperspace_tech',
        'plasma_tech',
        'combustion_drive',
        'impulse_drive',
        'hyperspace_drive',
        'espionage_tech',
        'computer_tech',
        'astrophysics',
        'intergalactic_network',
        'graviton_tech',
        'weapons_tech',
        'shielding_tech',
        'armor_tech'
      ]),
      allowNull: false,
      field: 'technology_type'
    },
    level: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    researchStartedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'research_started_at'
    },
    researchCompletesAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'research_completes_at'
    }
  }, {
    tableName: 'player_research',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['player_address', 'technology_type']
      },
      {
        fields: ['player_address']
      }
    ]
  });

  // Get research cost
  PlayerResearch.getResearchCost = function(technologyType, currentLevel) {
    const baseCosts = {
      energy_tech: { metal: 0, crystal: 800, deuterium: 400 },
      laser_tech: { metal: 200, crystal: 100, deuterium: 0 },
      ion_tech: { metal: 1000, crystal: 300, deuterium: 100 },
      hyperspace_tech: { metal: 0, crystal: 4000, deuterium: 2000 },
      plasma_tech: { metal: 2000, crystal: 4000, deuterium: 1000 },
      combustion_drive: { metal: 400, crystal: 0, deuterium: 600 },
      impulse_drive: { metal: 2000, crystal: 4000, deuterium: 600 },
      hyperspace_drive: { metal: 10000, crystal: 20000, deuterium: 6000 },
      espionage_tech: { metal: 200, crystal: 1000, deuterium: 200 },
      computer_tech: { metal: 0, crystal: 400, deuterium: 600 },
      astrophysics: { metal: 4000, crystal: 8000, deuterium: 4000 },
      intergalactic_network: { metal: 240000, crystal: 400000, deuterium: 160000 },
      graviton_tech: { metal: 0, crystal: 0, deuterium: 0 }, // Special - requires energy
      weapons_tech: { metal: 800, crystal: 200, deuterium: 0 },
      shielding_tech: { metal: 200, crystal: 600, deuterium: 0 },
      armor_tech: { metal: 1000, crystal: 0, deuterium: 0 }
    };

    const base = baseCosts[technologyType] || { metal: 1000, crystal: 500, deuterium: 250 };
    const multiplier = Math.pow(2, currentLevel);
    
    const cost = {};
    for (const [resource, amount] of Object.entries(base)) {
      cost[resource] = Math.floor(amount * multiplier);
    }
    
    return cost;
  };

  // Get research time in seconds
  PlayerResearch.getResearchTime = function(technologyType, currentLevel, researchLabLevel = 1) {
    const baseTimes = {
      energy_tech: 300,
      laser_tech: 180,
      ion_tech: 600,
      hyperspace_tech: 900,
      plasma_tech: 1200,
      combustion_drive: 240,
      impulse_drive: 480,
      hyperspace_drive: 720,
      espionage_tech: 180,
      computer_tech: 300,
      astrophysics: 600,
      intergalactic_network: 1800,
      graviton_tech: 3600,
      weapons_tech: 240,
      shielding_tech: 300,
      armor_tech: 360
    };

    const baseTime = baseTimes[technologyType] || 300;
    const levelMultiplier = Math.pow(1.5, currentLevel);
    const labReduction = 1 / (1 + 0.1 * researchLabLevel);
    
    return Math.floor(baseTime * levelMultiplier * labReduction);
  };

  // Get technology requirements
  PlayerResearch.getRequirements = function(technologyType) {
    const requirements = {
      energy_tech: { research_lab: 1 },
      laser_tech: { research_lab: 1, energy_tech: 2 },
      ion_tech: { research_lab: 4, energy_tech: 4, laser_tech: 5 },
      hyperspace_tech: { research_lab: 7, energy_tech: 5, shielding_tech: 5 },
      plasma_tech: { research_lab: 4, energy_tech: 8, laser_tech: 10, ion_tech: 5 },
      combustion_drive: { research_lab: 1, energy_tech: 1 },
      impulse_drive: { research_lab: 2, energy_tech: 1 },
      hyperspace_drive: { research_lab: 7, hyperspace_tech: 3 },
      espionage_tech: { research_lab: 3 },
      computer_tech: { research_lab: 1 },
      astrophysics: { research_lab: 3, espionage_tech: 4, impulse_drive: 3 },
      intergalactic_network: { research_lab: 10, computer_tech: 8, hyperspace_tech: 8 },
      graviton_tech: { research_lab: 12 },
      weapons_tech: { research_lab: 4 },
      shielding_tech: { research_lab: 6, energy_tech: 3 },
      armor_tech: { research_lab: 2 }
    };

    return requirements[technologyType] || { research_lab: 1 };
  };

  return PlayerResearch;
};
