const { PlayerFacility, PlayerResources } = require('../models');
const { Op } = require('sequelize');

// Helper to calculate production rates from facilities
async function calculateProductionRates(playerAddress) {
  const facilities = await PlayerFacility.findAll({
    where: { playerAddress, active: true }
  });

  let metalRate = 30; // Base production
  let crystalRate = 15;
  let deuteriumRate = 0;
  let energyProduction = 0;
  let energyConsumption = 0;

  for (const facility of facilities) {
    if (facility.level <= 0) continue;
    
    const production = facility.getProductionRate();
    
    // Resource production
    if (production.metal) metalRate += production.metal;
    if (production.crystal) crystalRate += production.crystal;
    if (production.deuterium) {
      if (production.deuterium > 0) {
        deuteriumRate += production.deuterium;
      } else {
        // Fusion reactor consumes deuterium
        energyConsumption += Math.abs(production.deuterium);
      }
    }
    
    // Energy
    if (production.energy) {
      if (production.energy > 0) {
        energyProduction += production.energy;
      }
    }
    
    // Energy consumption from mines
    if (['metal_mine', 'crystal_refinery', 'deuterium_synthesizer'].includes(facility.facilityType)) {
      energyConsumption += Math.floor(10 * facility.level * Math.pow(1.1, facility.level));
    }
  }

  return {
    metalRate,
    crystalRate,
    deuteriumRate,
    energyProduction,
    energyConsumption
  };
}

// Get player facilities
exports.getPlayerFacilities = async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!address) {
      return res.status(400).json({ error: 'Player address required' });
    }

    // Complete any finished upgrades
    const now = new Date();
    const completedUpgrades = await PlayerFacility.findAll({
      where: {
        playerAddress: address,
        upgradeCompletesAt: { [Op.lte]: now },
        upgradeStartedAt: { [Op.ne]: null }
      }
    });

    for (const facility of completedUpgrades) {
      facility.level += 1;
      facility.upgradeStartedAt = null;
      facility.upgradeCompletesAt = null;
      await facility.save();
    }

    // Get all facilities
    let facilities = await PlayerFacility.findAll({
      where: { playerAddress: address }
    });

    // If no facilities exist, create default ones
    if (facilities.length === 0) {
      const facilityTypes = [
        'metal_mine', 'crystal_refinery', 'deuterium_synthesizer',
        'solar_plant', 'fusion_reactor', 'robotics_factory',
        'shipyard', 'research_lab', 'missile_silo', 'nanite_factory'
      ];
      
      facilities = await Promise.all(
        facilityTypes.map(type => 
          PlayerFacility.create({
            playerAddress: address,
            facilityType: type,
            level: 0
          })
        )
      );
    }

    // Calculate production rates
    const rates = await calculateProductionRates(address);

    // Update player resources production rates if they exist
    const playerResources = await PlayerResources.findOne({
      where: { playerAddress: address }
    });
    
    if (playerResources) {
      playerResources.metalProductionRate = rates.metalRate;
      playerResources.crystalProductionRate = rates.crystalRate;
      playerResources.deuteriumProductionRate = rates.deuteriumRate;
      playerResources.energyProduction = rates.energyProduction;
      playerResources.energyConsumption = rates.energyConsumption;
      await playerResources.save();
    }

    // Add upgrade info to each facility
    const facilitiesWithInfo = facilities.map(f => {
      const facility = f.toJSON();
      facility.upgradeCost = PlayerFacility.getUpgradeCost(f.facilityType, f.level);
      
      // Find robotics and nanite levels for time calculation
      const robotics = facilities.find(fac => fac.facilityType === 'robotics_factory');
      const nanite = facilities.find(fac => fac.facilityType === 'nanite_factory');
      
      facility.upgradeTime = PlayerFacility.getUpgradeTime(
        f.facilityType, 
        f.level,
        robotics?.level || 0,
        nanite?.level || 0
      );
      facility.production = f.getProductionRate();
      facility.isUpgrading = !!f.upgradeStartedAt;
      
      return facility;
    });

    res.json({
      facilities: facilitiesWithInfo,
      productionRates: rates
    });
  } catch (error) {
    console.error('Error fetching facilities:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Build/upgrade facility
exports.buildFacility = async (req, res) => {
  try {
    const { playerAddress, facilityType } = req.body;

    if (!playerAddress || !facilityType) {
      return res.status(400).json({ error: 'Player address and facility type required' });
    }

    // Get or create player resources
    let playerResources = await PlayerResources.findOne({
      where: { playerAddress }
    });

    if (!playerResources) {
      playerResources = await PlayerResources.create({ playerAddress });
    }

    // Update resources based on time
    await playerResources.updateResources();

    // Get or create facility
    let facility = await PlayerFacility.findOne({
      where: { playerAddress, facilityType }
    });

    if (!facility) {
      facility = await PlayerFacility.create({
        playerAddress,
        facilityType,
        level: 0
      });
    }

    // Check if already upgrading
    if (facility.upgradeStartedAt) {
      return res.status(400).json({ 
        error: 'Facility is already being upgraded',
        completesAt: facility.upgradeCompletesAt
      });
    }

    // Get upgrade cost
    const cost = PlayerFacility.getUpgradeCost(facilityType, facility.level);

    // Check if player can afford
    if (!playerResources.canAfford(cost)) {
      return res.status(400).json({ 
        error: 'Insufficient resources',
        required: cost,
        available: {
          metal: parseFloat(playerResources.metal),
          crystal: parseFloat(playerResources.crystal),
          deuterium: parseFloat(playerResources.deuterium)
        }
      });
    }

    // Get upgrade time
    const robotics = await PlayerFacility.findOne({
      where: { playerAddress, facilityType: 'robotics_factory' }
    });
    const nanite = await PlayerFacility.findOne({
      where: { playerAddress, facilityType: 'nanite_factory' }
    });

    const upgradeTimeSeconds = PlayerFacility.getUpgradeTime(
      facilityType,
      facility.level,
      robotics?.level || 0,
      nanite?.level || 0
    );

    // Deduct resources
    await playerResources.deductResources(cost);

    // Start upgrade
    const now = new Date();
    facility.upgradeStartedAt = now;
    facility.upgradeCompletesAt = new Date(now.getTime() + upgradeTimeSeconds * 1000);
    await facility.save();

    res.json({
      message: 'Upgrade started',
      facility: {
        ...facility.toJSON(),
        upgradeTime: upgradeTimeSeconds,
        upgradeCost: cost
      },
      remainingResources: {
        metal: parseFloat(playerResources.metal),
        crystal: parseFloat(playerResources.crystal),
        deuterium: parseFloat(playerResources.deuterium)
      }
    });
  } catch (error) {
    console.error('Error building facility:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

// Cancel facility upgrade
exports.cancelUpgrade = async (req, res) => {
  try {
    const { playerAddress, facilityType } = req.body;

    const facility = await PlayerFacility.findOne({
      where: { playerAddress, facilityType }
    });

    if (!facility || !facility.upgradeStartedAt) {
      return res.status(400).json({ error: 'No active upgrade to cancel' });
    }

    // Refund partial resources (50%)
    const cost = PlayerFacility.getUpgradeCost(facilityType, facility.level);
    const refund = {
      metal: Math.floor(cost.metal * 0.5),
      crystal: Math.floor(cost.crystal * 0.5),
      deuterium: Math.floor((cost.deuterium || 0) * 0.5)
    };

    const playerResources = await PlayerResources.findOne({
      where: { playerAddress }
    });

    if (playerResources) {
      await playerResources.addResources(refund);
    }

    // Cancel upgrade
    facility.upgradeStartedAt = null;
    facility.upgradeCompletesAt = null;
    await facility.save();

    res.json({
      message: 'Upgrade cancelled',
      refund,
      facility: facility.toJSON()
    });
  } catch (error) {
    console.error('Error cancelling upgrade:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Export helper for use in other controllers
exports.calculateProductionRates = calculateProductionRates;
