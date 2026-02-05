module.exports = (sequelize, DataTypes) => {
  const PlayerResources = sequelize.define('PlayerResources', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    playerAddress: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      field: 'player_address'
    },
    metal: {
      type: DataTypes.DECIMAL(20, 6),
      defaultValue: 500,
      allowNull: false
    },
    crystal: {
      type: DataTypes.DECIMAL(20, 6),
      defaultValue: 500,
      allowNull: false
    },
    deuterium: {
      type: DataTypes.DECIMAL(20, 6),
      defaultValue: 0,
      allowNull: false
    },
    energy: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    lastResourceUpdate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
      field: 'last_resource_update'
    },
    metalProductionRate: {
      type: DataTypes.DECIMAL(20, 6),
      defaultValue: 30, // Base production per hour
      allowNull: false,
      field: 'metal_production_rate'
    },
    crystalProductionRate: {
      type: DataTypes.DECIMAL(20, 6),
      defaultValue: 15, // Base production per hour
      allowNull: false,
      field: 'crystal_production_rate'
    },
    deuteriumProductionRate: {
      type: DataTypes.DECIMAL(20, 6),
      defaultValue: 0,
      allowNull: false,
      field: 'deuterium_production_rate'
    },
    energyProduction: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      field: 'energy_production'
    },
    energyConsumption: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      field: 'energy_consumption'
    },
    storageCapacityMetal: {
      type: DataTypes.DECIMAL(20, 6),
      defaultValue: 10000,
      allowNull: false,
      field: 'storage_capacity_metal'
    },
    storageCapacityCrystal: {
      type: DataTypes.DECIMAL(20, 6),
      defaultValue: 10000,
      allowNull: false,
      field: 'storage_capacity_crystal'
    },
    storageCapacityDeuterium: {
      type: DataTypes.DECIMAL(20, 6),
      defaultValue: 10000,
      allowNull: false,
      field: 'storage_capacity_deuterium'
    }
  }, {
    tableName: 'player_resources',
    timestamps: true,
    underscored: true
  });

  // Update resources based on time elapsed
  PlayerResources.prototype.updateResources = async function() {
    const now = new Date();
    const lastUpdate = new Date(this.lastResourceUpdate);
    const hoursElapsed = (now - lastUpdate) / (1000 * 60 * 60);
    
    if (hoursElapsed < 0.01) return this; // Less than 36 seconds, skip update

    // Calculate energy efficiency (if consumption > production, reduce resource rates)
    const energyRatio = this.energyProduction > 0 
      ? Math.min(1, this.energyProduction / Math.max(this.energyConsumption, 1))
      : (this.energyConsumption > 0 ? 0 : 1);

    // Calculate new resource amounts
    const metalGained = parseFloat(this.metalProductionRate) * hoursElapsed * energyRatio;
    const crystalGained = parseFloat(this.crystalProductionRate) * hoursElapsed * energyRatio;
    const deuteriumGained = parseFloat(this.deuteriumProductionRate) * hoursElapsed * energyRatio;

    // Apply storage caps
    this.metal = Math.min(
      parseFloat(this.metal) + metalGained,
      parseFloat(this.storageCapacityMetal)
    );
    this.crystal = Math.min(
      parseFloat(this.crystal) + crystalGained,
      parseFloat(this.storageCapacityCrystal)
    );
    this.deuterium = Math.min(
      parseFloat(this.deuterium) + deuteriumGained,
      parseFloat(this.storageCapacityDeuterium)
    );
    
    this.lastResourceUpdate = now;
    
    await this.save();
    return this;
  };

  // Check if player can afford something
  PlayerResources.prototype.canAfford = function(cost) {
    return (
      parseFloat(this.metal) >= (cost.metal || 0) &&
      parseFloat(this.crystal) >= (cost.crystal || 0) &&
      parseFloat(this.deuterium) >= (cost.deuterium || 0)
    );
  };

  // Deduct resources
  PlayerResources.prototype.deductResources = async function(cost) {
    if (!this.canAfford(cost)) {
      throw new Error('Insufficient resources');
    }

    this.metal = parseFloat(this.metal) - (cost.metal || 0);
    this.crystal = parseFloat(this.crystal) - (cost.crystal || 0);
    this.deuterium = parseFloat(this.deuterium) - (cost.deuterium || 0);
    
    await this.save();
    return this;
  };

  // Add resources
  PlayerResources.prototype.addResources = async function(resources) {
    this.metal = Math.min(
      parseFloat(this.metal) + (resources.metal || 0),
      parseFloat(this.storageCapacityMetal)
    );
    this.crystal = Math.min(
      parseFloat(this.crystal) + (resources.crystal || 0),
      parseFloat(this.storageCapacityCrystal)
    );
    this.deuterium = Math.min(
      parseFloat(this.deuterium) + (resources.deuterium || 0),
      parseFloat(this.storageCapacityDeuterium)
    );
    
    await this.save();
    return this;
  };

  return PlayerResources;
};
