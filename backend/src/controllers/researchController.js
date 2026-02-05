const { PlayerResearch, PlayerResources, PlayerFacility } = require('../models');
const { Op } = require('sequelize');

// Get player research
exports.getPlayerResearch = async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!address) {
      return res.status(400).json({ error: 'Player address required' });
    }

    // Complete any finished research
    const now = new Date();
    const completedResearch = await PlayerResearch.findAll({
      where: {
        playerAddress: address,
        researchCompletesAt: { [Op.lte]: now },
        researchStartedAt: { [Op.ne]: null }
      }
    });

    for (const research of completedResearch) {
      research.level += 1;
      research.researchStartedAt = null;
      research.researchCompletesAt = null;
      await research.save();
    }

    // Get all research
    let research = await PlayerResearch.findAll({
      where: { playerAddress: address }
    });

    // If no research exists, create default ones
    if (research.length === 0) {
      const techTypes = [
        'energy_tech', 'laser_tech', 'ion_tech', 'hyperspace_tech',
        'plasma_tech', 'combustion_drive', 'impulse_drive', 'hyperspace_drive',
        'espionage_tech', 'computer_tech', 'astrophysics', 'intergalactic_network',
        'graviton_tech', 'weapons_tech', 'shielding_tech', 'armor_tech'
      ];
      
      research = await Promise.all(
        techTypes.map(type => 
          PlayerResearch.create({
            playerAddress: address,
            technologyType: type,
            level: 0
          })
        )
      );
    }

    // Get research lab level for time calculations
    const researchLab = await PlayerFacility.findOne({
      where: { playerAddress: address, facilityType: 'research_lab' }
    });

    // Build research map for requirements checking
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

    // Add research info
    const researchWithInfo = research.map(r => {
      const tech = r.toJSON();
      tech.researchCost = PlayerResearch.getResearchCost(r.technologyType, r.level);
      tech.researchTime = PlayerResearch.getResearchTime(
        r.technologyType,
        r.level,
        researchLab?.level || 1
      );
      tech.requirements = PlayerResearch.getRequirements(r.technologyType);
      tech.isResearching = !!r.researchStartedAt;
      
      // Check if requirements are met
      tech.requirementsMet = true;
      for (const [req, level] of Object.entries(tech.requirements)) {
        if (req === 'research_lab') {
          if ((facilityMap[req] || 0) < level) {
            tech.requirementsMet = false;
            break;
          }
        } else {
          if ((researchMap[req] || 0) < level) {
            tech.requirementsMet = false;
            break;
          }
        }
      }
      
      return tech;
    });

    // Check if any research is in progress
    const activeResearch = research.find(r => r.researchStartedAt);

    res.json({
      research: researchWithInfo,
      researchLabLevel: researchLab?.level || 0,
      activeResearch: activeResearch ? {
        technologyType: activeResearch.technologyType,
        completesAt: activeResearch.researchCompletesAt
      } : null
    });
  } catch (error) {
    console.error('Error fetching research:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Start research
exports.startResearch = async (req, res) => {
  try {
    const { playerAddress, technologyType } = req.body;

    if (!playerAddress || !technologyType) {
      return res.status(400).json({ error: 'Player address and technology type required' });
    }

    // Check if any research is already in progress
    const activeResearch = await PlayerResearch.findOne({
      where: {
        playerAddress,
        researchStartedAt: { [Op.ne]: null }
      }
    });

    if (activeResearch) {
      return res.status(400).json({
        error: 'Another research is already in progress',
        activeResearch: {
          technologyType: activeResearch.technologyType,
          completesAt: activeResearch.researchCompletesAt
        }
      });
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

    // Get or create research
    let research = await PlayerResearch.findOne({
      where: { playerAddress, technologyType }
    });

    if (!research) {
      research = await PlayerResearch.create({
        playerAddress,
        technologyType,
        level: 0
      });
    }

    // Check requirements
    const requirements = PlayerResearch.getRequirements(technologyType);
    
    // Check research lab
    const researchLab = await PlayerFacility.findOne({
      where: { playerAddress, facilityType: 'research_lab' }
    });

    if (requirements.research_lab && (!researchLab || researchLab.level < requirements.research_lab)) {
      return res.status(400).json({
        error: `Requires Research Lab level ${requirements.research_lab}`,
        currentLevel: researchLab?.level || 0
      });
    }

    // Check tech requirements
    for (const [techReq, level] of Object.entries(requirements)) {
      if (techReq === 'research_lab') continue;
      
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

    // Get research cost
    const cost = PlayerResearch.getResearchCost(technologyType, research.level);

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

    // Get research time
    const researchTimeSeconds = PlayerResearch.getResearchTime(
      technologyType,
      research.level,
      researchLab?.level || 1
    );

    // Deduct resources
    await playerResources.deductResources(cost);

    // Start research
    const now = new Date();
    research.researchStartedAt = now;
    research.researchCompletesAt = new Date(now.getTime() + researchTimeSeconds * 1000);
    await research.save();

    res.json({
      message: 'Research started',
      research: {
        ...research.toJSON(),
        researchTime: researchTimeSeconds,
        researchCost: cost
      },
      remainingResources: {
        metal: parseFloat(playerResources.metal),
        crystal: parseFloat(playerResources.crystal),
        deuterium: parseFloat(playerResources.deuterium)
      }
    });
  } catch (error) {
    console.error('Error starting research:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

// Cancel research
exports.cancelResearch = async (req, res) => {
  try {
    const { playerAddress, technologyType } = req.body;

    const research = await PlayerResearch.findOne({
      where: { playerAddress, technologyType }
    });

    if (!research || !research.researchStartedAt) {
      return res.status(400).json({ error: 'No active research to cancel' });
    }

    // Refund partial resources (50%)
    const cost = PlayerResearch.getResearchCost(technologyType, research.level);
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

    // Cancel research
    research.researchStartedAt = null;
    research.researchCompletesAt = null;
    await research.save();

    res.json({
      message: 'Research cancelled',
      refund,
      research: research.toJSON()
    });
  } catch (error) {
    console.error('Error cancelling research:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
