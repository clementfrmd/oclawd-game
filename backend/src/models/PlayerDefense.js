module.exports = (sequelize, DataTypes) => {
  const PlayerDefense = sequelize.define('PlayerDefense', {
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
    defenseType: {
      type: DataTypes.ENUM([
        'rocket_launcher',
        'light_laser',
        'heavy_laser',
        'gauss_cannon',
        'ion_cannon',
        'plasma_turret',
        'small_shield_dome',
        'large_shield_dome',
        'anti_ballistic_missile',
        'interplanetary_missile'
      ]),
      allowNull: false,
      field: 'defense_type'
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    buildingQuantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      field: 'building_quantity'
    },
    buildCompletesAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'build_completes_at'
    }
  }, {
    tableName: 'player_defenses',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['player_address', 'defense_type']
      },
      {
        fields: ['player_address']
      }
    ]
  });

  // Get defense build cost per unit
  PlayerDefense.getBuildCost = function(defenseType, quantity = 1) {
    const baseCosts = {
      rocket_launcher: { metal: 2000, crystal: 0, deuterium: 0 },
      light_laser: { metal: 1500, crystal: 500, deuterium: 0 },
      heavy_laser: { metal: 6000, crystal: 2000, deuterium: 0 },
      gauss_cannon: { metal: 20000, crystal: 15000, deuterium: 2000 },
      ion_cannon: { metal: 5000, crystal: 3000, deuterium: 0 },
      plasma_turret: { metal: 50000, crystal: 50000, deuterium: 30000 },
      small_shield_dome: { metal: 10000, crystal: 10000, deuterium: 0 },
      large_shield_dome: { metal: 50000, crystal: 50000, deuterium: 0 },
      anti_ballistic_missile: { metal: 8000, crystal: 0, deuterium: 2000 },
      interplanetary_missile: { metal: 12500, crystal: 2500, deuterium: 10000 }
    };

    const base = baseCosts[defenseType] || { metal: 1000, crystal: 500, deuterium: 0 };
    
    const cost = {};
    for (const [resource, amount] of Object.entries(base)) {
      cost[resource] = amount * quantity;
    }
    
    return cost;
  };

  // Get build time per unit in seconds
  PlayerDefense.getBuildTime = function(defenseType, quantity = 1, shipyardLevel = 1, naniteLevel = 0) {
    const baseTimes = {
      rocket_launcher: 30,
      light_laser: 45,
      heavy_laser: 120,
      gauss_cannon: 300,
      ion_cannon: 180,
      plasma_turret: 600,
      small_shield_dome: 900,
      large_shield_dome: 1800,
      anti_ballistic_missile: 240,
      interplanetary_missile: 480
    };

    const baseTime = baseTimes[defenseType] || 60;
    const shipyardReduction = 1 / (1 + 0.1 * shipyardLevel);
    const naniteReduction = Math.pow(0.5, naniteLevel);
    
    return Math.floor(baseTime * quantity * shipyardReduction * naniteReduction);
  };

  // Get defense stats
  PlayerDefense.getStats = function(defenseType) {
    const stats = {
      rocket_launcher: { attack: 80, shield: 20, hull: 2000 },
      light_laser: { attack: 100, shield: 25, hull: 2000 },
      heavy_laser: { attack: 250, shield: 100, hull: 8000 },
      gauss_cannon: { attack: 1100, shield: 200, hull: 35000 },
      ion_cannon: { attack: 150, shield: 500, hull: 8000 },
      plasma_turret: { attack: 3000, shield: 300, hull: 100000 },
      small_shield_dome: { attack: 1, shield: 2000, hull: 20000 },
      large_shield_dome: { attack: 1, shield: 10000, hull: 100000 },
      anti_ballistic_missile: { attack: 1, shield: 1, hull: 8000 },
      interplanetary_missile: { attack: 12000, shield: 1, hull: 15000 }
    };

    return stats[defenseType] || { attack: 0, shield: 0, hull: 0 };
  };

  // Get requirements for building defense
  PlayerDefense.getRequirements = function(defenseType) {
    const requirements = {
      rocket_launcher: { shipyard: 1 },
      light_laser: { shipyard: 1, energy_tech: 1, laser_tech: 3 },
      heavy_laser: { shipyard: 1, energy_tech: 3, laser_tech: 6 },
      gauss_cannon: { shipyard: 6, energy_tech: 6, weapons_tech: 3, shielding_tech: 1 },
      ion_cannon: { shipyard: 4, ion_tech: 4 },
      plasma_turret: { shipyard: 8, plasma_tech: 7 },
      small_shield_dome: { shipyard: 1, shielding_tech: 2 },
      large_shield_dome: { shipyard: 6, shielding_tech: 6 },
      anti_ballistic_missile: { shipyard: 1, missile_silo: 2 },
      interplanetary_missile: { shipyard: 1, missile_silo: 4, impulse_drive: 1 }
    };

    return requirements[defenseType] || { shipyard: 1 };
  };

  return PlayerDefense;
};
