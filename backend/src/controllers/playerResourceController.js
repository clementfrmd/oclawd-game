const { PlayerResources, PlayerFacility } = require('../models');
const { calculateProductionRates } = require('./facilityController');

// Get player resources (with time-based update)
exports.getPlayerResources = async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!address) {
      return res.status(400).json({ error: 'Player address required' });
    }

    // Get or create player resources
    let playerResources = await PlayerResources.findOne({
      where: { playerAddress: address }
    });

    if (!playerResources) {
      playerResources = await PlayerResources.create({
        playerAddress: address,
        metal: 500,
        crystal: 500,
        deuterium: 0
      });
    }

    // Update production rates from facilities
    const rates = await calculateProductionRates(address);
    playerResources.metalProductionRate = rates.metalRate;
    playerResources.crystalProductionRate = rates.crystalRate;
    playerResources.deuteriumProductionRate = rates.deuteriumRate;
    playerResources.energyProduction = rates.energyProduction;
    playerResources.energyConsumption = rates.energyConsumption;
    await playerResources.save();

    // Update resources based on time elapsed
    await playerResources.updateResources();

    // Calculate energy balance
    const energyBalance = rates.energyProduction - rates.energyConsumption;
    const energyRatio = rates.energyProduction > 0 
      ? Math.min(1, rates.energyProduction / Math.max(rates.energyConsumption, 1))
      : (rates.energyConsumption > 0 ? 0 : 1);

    res.json({
      resources: {
        metal: parseFloat(playerResources.metal),
        crystal: parseFloat(playerResources.crystal),
        deuterium: parseFloat(playerResources.deuterium),
        energy: energyBalance
      },
      productionRates: {
        metal: parseFloat(playerResources.metalProductionRate) * energyRatio,
        crystal: parseFloat(playerResources.crystalProductionRate) * energyRatio,
        deuterium: parseFloat(playerResources.deuteriumProductionRate) * energyRatio,
        energyProduction: rates.energyProduction,
        energyConsumption: rates.energyConsumption
      },
      storage: {
        metal: parseFloat(playerResources.storageCapacityMetal),
        crystal: parseFloat(playerResources.storageCapacityCrystal),
        deuterium: parseFloat(playerResources.storageCapacityDeuterium)
      },
      energyEfficiency: Math.round(energyRatio * 100),
      lastUpdate: playerResources.lastResourceUpdate
    });
  } catch (error) {
    console.error('Error fetching player resources:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add resources (for testing/admin)
exports.addResources = async (req, res) => {
  try {
    const { playerAddress, metal = 0, crystal = 0, deuterium = 0 } = req.body;

    if (!playerAddress) {
      return res.status(400).json({ error: 'Player address required' });
    }

    let playerResources = await PlayerResources.findOne({
      where: { playerAddress }
    });

    if (!playerResources) {
      playerResources = await PlayerResources.create({ playerAddress });
    }

    await playerResources.addResources({ metal, crystal, deuterium });

    res.json({
      message: 'Resources added',
      resources: {
        metal: parseFloat(playerResources.metal),
        crystal: parseFloat(playerResources.crystal),
        deuterium: parseFloat(playerResources.deuterium)
      }
    });
  } catch (error) {
    console.error('Error adding resources:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Initialize player (create all default records)
exports.initializePlayer = async (req, res) => {
  try {
    const { playerAddress } = req.body;

    if (!playerAddress) {
      return res.status(400).json({ error: 'Player address required' });
    }

    // Check if player already exists
    let playerResources = await PlayerResources.findOne({
      where: { playerAddress }
    });

    if (playerResources) {
      return res.status(400).json({ error: 'Player already initialized' });
    }

    // Create player resources
    playerResources = await PlayerResources.create({
      playerAddress,
      metal: 500,
      crystal: 500,
      deuterium: 0
    });

    // Create default facilities
    const facilityTypes = [
      'metal_mine', 'crystal_refinery', 'deuterium_synthesizer',
      'solar_plant', 'fusion_reactor', 'robotics_factory',
      'shipyard', 'research_lab', 'missile_silo', 'nanite_factory'
    ];
    
    await Promise.all(
      facilityTypes.map(type => 
        PlayerFacility.create({
          playerAddress,
          facilityType: type,
          level: 0
        })
      )
    );

    res.json({
      message: 'Player initialized',
      playerAddress,
      resources: {
        metal: parseFloat(playerResources.metal),
        crystal: parseFloat(playerResources.crystal),
        deuterium: parseFloat(playerResources.deuterium)
      }
    });
  } catch (error) {
    console.error('Error initializing player:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get dashboard data (combined view)
exports.getDashboard = async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!address) {
      return res.status(400).json({ error: 'Player address required' });
    }

    // Get resources
    let playerResources = await PlayerResources.findOne({
      where: { playerAddress: address }
    });

    if (!playerResources) {
      playerResources = await PlayerResources.create({
        playerAddress: address,
        metal: 500,
        crystal: 500,
        deuterium: 0
      });
    }

    // Update production rates
    const rates = await calculateProductionRates(address);
    playerResources.metalProductionRate = rates.metalRate;
    playerResources.crystalProductionRate = rates.crystalRate;
    playerResources.deuteriumProductionRate = rates.deuteriumRate;
    playerResources.energyProduction = rates.energyProduction;
    playerResources.energyConsumption = rates.energyConsumption;
    await playerResources.save();

    // Update resources based on time
    await playerResources.updateResources();

    // Get facility levels
    const facilities = await PlayerFacility.findAll({
      where: { playerAddress: address }
    });

    // Get active upgrades
    const activeUpgrades = facilities.filter(f => f.upgradeStartedAt).map(f => ({
      facilityType: f.facilityType,
      completesAt: f.upgradeCompletesAt
    }));

    // Calculate energy
    const energyBalance = rates.energyProduction - rates.energyConsumption;
    const energyRatio = rates.energyProduction > 0 
      ? Math.min(1, rates.energyProduction / Math.max(rates.energyConsumption, 1))
      : (rates.energyConsumption > 0 ? 0 : 1);

    res.json({
      playerAddress: address,
      resources: {
        metal: Math.floor(parseFloat(playerResources.metal)),
        crystal: Math.floor(parseFloat(playerResources.crystal)),
        deuterium: Math.floor(parseFloat(playerResources.deuterium)),
        energy: energyBalance
      },
      production: {
        metal: Math.floor(parseFloat(playerResources.metalProductionRate) * energyRatio),
        crystal: Math.floor(parseFloat(playerResources.crystalProductionRate) * energyRatio),
        deuterium: Math.floor(parseFloat(playerResources.deuteriumProductionRate) * energyRatio)
      },
      energyEfficiency: Math.round(energyRatio * 100),
      facilities: facilities.reduce((acc, f) => {
        acc[f.facilityType] = f.level;
        return acc;
      }, {}),
      activeUpgrades,
      lastUpdate: playerResources.lastResourceUpdate
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
