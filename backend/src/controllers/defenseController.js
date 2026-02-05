const { PlayerDefense, PlayerResources, PlayerFacility, PlayerResearch } = require('../models');
const { Op } = require('sequelize');

// Get player defenses
exports.getPlayerDefenses = async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!address) {
      return res.status(400).json({ error: 'Player address required' });
    }

    // Complete any finished builds
    const now = new Date();
    const completedBuilds = await PlayerDefense.findAll({
      where: {
        playerAddress: address,
        buildCompletesAt: { [Op.lte]: now },
        buildingQuantity: { [Op.gt]: 0 }
      }
    });

    for (const defense of completedBuilds) {
      defense.quantity += defense.buildingQuantity;
      defense.buildingQuantity = 0;
      defense.buildCompletesAt = null;
      await defense.save();
    }

    // Get all defenses
    let defenses = await PlayerDefense.findAll({
      where: { playerAddress: address }
    });

    // If no defenses exist, create default ones
    if (defenses.length === 0) {
      const defenseTypes = [
        'rocket_launcher', 'light_laser', 'heavy_laser', 'gauss_cannon',
        'ion_cannon', 'plasma_turret', 'small_shield_dome', 'large_shield_dome',
        'anti_ballistic_missile', 'interplanetary_missile'
      ];
      
      defenses = await Promise.all(
        defenseTypes.map(type => 
          PlayerDefense.create({
            playerAddress: address,
            defenseType: type,
            quantity: 0
          })
        )
      );
    }

    // Get shipyard and nanite levels for time calculations
    const shipyard = await PlayerFacility.findOne({
      where: { playerAddress: address, facilityType: 'shipyard' }
    });
    const nanite = await PlayerFacility.findOne({
      where: { playerAddress: address, facilityType: 'nanite_factory' }
    });
    const missileSilo = await PlayerFacility.findOne({
      where: { playerAddress: address, facilityType: 'missile_silo' }
    });

    // Get research levels for requirements
    const research = await PlayerResearch.findAll({
      where: { playerAddress: address }
    });
    const researchMap = {};
    research.forEach(r => {
      researchMap[r.technologyType] = r.level;
    });

    // Get facility levels for requirements
    const facilities = await PlayerFacility.findAll({
      where: { playerAddress: address }
    });
    const facilityMap = {};
    facilities.forEach(f => {
      facilityMap[f.facilityType] = f.level;
    });

    // Add defense info
    const defensesWithInfo = defenses.map(d => {
      const defense = d.toJSON();
      defense.buildCost = PlayerDefense.getBuildCost(d.defenseType, 1);
      defense.buildTime = PlayerDefense.getBuildTime(
        d.defenseType,
        1,
        shipyard?.level || 1,
        nanite?.level || 0
      );
      defense.stats = PlayerDefense.getStats(d.defenseType);
      defense.requirements = PlayerDefense.getRequirements(d.defenseType);
      defense.isBuilding = d.buildingQuantity > 0;
      
      // Check if requirements are met
      defense.requirementsMet = true;
      for (const [req, level] of Object.entries(defense.requirements)) {
        if (['shipyard', 'missile_silo'].includes(req)) {
          if ((facilityMap[req] || 0) < level) {
            defense.requirementsMet = false;
            break;
          }
        } else {
          if ((researchMap[req] || 0) < level) {
            defense.requirementsMet = false;
            break;
          }
        }
      }
      
      return defense;
    });

    // Calculate total defense power
    const totalDefensePower = defenses.reduce((total, d) => {
      const stats = PlayerDefense.getStats(d.defenseType);
      return total + (stats.attack * d.quantity);
    }, 0);

    res.json({
      defenses: defensesWithInfo,
      shipyardLevel: shipyard?.level || 0,
      missileSiloLevel: missileSilo?.level || 0,
      totalDefensePower
    });
  } catch (error) {
    console.error('Error fetching defenses:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Build defense
exports.buildDefense = async (req, res) => {
  try {
    const { playerAddress, defenseType, quantity = 1 } = req.body;

    if (!playerAddress || !defenseType) {
      return res.status(400).json({ error: 'Player address and defense type required' });
    }

    if (quantity < 1 || quantity > 1000) {
      return res.status(400).json({ error: 'Quantity must be between 1 and 1000' });
    }

    // Check for unique defenses (shield domes)
    if (['small_shield_dome', 'large_shield_dome'].includes(defenseType)) {
      const existing = await PlayerDefense.findOne({
        where: { playerAddress, defenseType }
      });
      if (existing && (existing.quantity > 0 || existing.buildingQuantity > 0)) {
        return res.status(400).json({ error: 'You can only have one shield dome of each type' });
      }
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

    // Check requirements
    const requirements = PlayerDefense.getRequirements(defenseType);
    
    // Check shipyard
    const shipyard = await PlayerFacility.findOne({
      where: { playerAddress, facilityType: 'shipyard' }
    });

    if (requirements.shipyard && (!shipyard || shipyard.level < requirements.shipyard)) {
      return res.status(400).json({
        error: `Requires Shipyard level ${requirements.shipyard}`,
        currentLevel: shipyard?.level || 0
      });
    }

    // Check missile silo
    if (requirements.missile_silo) {
      const missileSilo = await PlayerFacility.findOne({
        where: { playerAddress, facilityType: 'missile_silo' }
      });
      if (!missileSilo || missileSilo.level < requirements.missile_silo) {
        return res.status(400).json({
          error: `Requires Missile Silo level ${requirements.missile_silo}`,
          currentLevel: missileSilo?.level || 0
        });
      }
    }

    // Check tech requirements
    for (const [techReq, level] of Object.entries(requirements)) {
      if (['shipyard', 'missile_silo'].includes(techReq)) continue;
      
      const reqTech = await PlayerResearch.findOne({
        where: { playerAddress, technologyType: techReq }
      });
      
      if (!reqTech || reqTech.level < level) {
        return res.status(400).json({
          error: `Requires ${techReq} level ${level}`,
          currentLevel: reqTech?.level || 0
        });
      }
    }

    // Get build cost
    const cost = PlayerDefense.getBuildCost(defenseType, quantity);

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

    // Get or create defense
    let defense = await PlayerDefense.findOne({
      where: { playerAddress, defenseType }
    });

    if (!defense) {
      defense = await PlayerDefense.create({
        playerAddress,
        defenseType,
        quantity: 0
      });
    }

    // Check if already building
    if (defense.buildingQuantity > 0) {
      return res.status(400).json({
        error: 'Defense units are already being built',
        completesAt: defense.buildCompletesAt,
        buildingQuantity: defense.buildingQuantity
      });
    }

    // Get nanite level
    const nanite = await PlayerFacility.findOne({
      where: { playerAddress, facilityType: 'nanite_factory' }
    });

    // Get build time
    const buildTimeSeconds = PlayerDefense.getBuildTime(
      defenseType,
      quantity,
      shipyard?.level || 1,
      nanite?.level || 0
    );

    // Deduct resources
    await playerResources.deductResources(cost);

    // Start build
    const now = new Date();
    defense.buildingQuantity = quantity;
    defense.buildCompletesAt = new Date(now.getTime() + buildTimeSeconds * 1000);
    await defense.save();

    res.json({
      message: 'Defense build started',
      defense: {
        ...defense.toJSON(),
        buildTime: buildTimeSeconds,
        buildCost: cost
      },
      remainingResources: {
        metal: parseFloat(playerResources.metal),
        crystal: parseFloat(playerResources.crystal),
        deuterium: parseFloat(playerResources.deuterium)
      }
    });
  } catch (error) {
    console.error('Error building defense:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

// Cancel defense build
exports.cancelBuild = async (req, res) => {
  try {
    const { playerAddress, defenseType } = req.body;

    const defense = await PlayerDefense.findOne({
      where: { playerAddress, defenseType }
    });

    if (!defense || defense.buildingQuantity === 0) {
      return res.status(400).json({ error: 'No active build to cancel' });
    }

    // Refund partial resources (50%)
    const cost = PlayerDefense.getBuildCost(defenseType, defense.buildingQuantity);
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

    // Cancel build
    defense.buildingQuantity = 0;
    defense.buildCompletesAt = null;
    await defense.save();

    res.json({
      message: 'Build cancelled',
      refund,
      defense: defense.toJSON()
    });
  } catch (error) {
    console.error('Error cancelling build:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
