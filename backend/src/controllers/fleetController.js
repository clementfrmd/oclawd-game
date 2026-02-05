const { Fleet, Station } = require('../models');

// Get all fleets
exports.getAllFleets = async (req, res) => {
  try {
    const fleets = await Fleet.findAll({
      include: [{ model: Station, as: 'station' }]
    });
    res.json(fleets);
  } catch (error) {
    console.error('Error fetching fleets:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get fleet by ID
exports.getFleet = async (req, res) => {
  try {
    const fleet = await Fleet.findByPk(req.params.id, {
      include: [{ model: Station, as: 'station' }]
    });

    if (!fleet) {
      return res.status(404).json({ error: 'Fleet not found' });
    }

    res.json(fleet);
  } catch (error) {
    console.error('Error fetching fleet:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get fleets by station
exports.getFleetsByStation = async (req, res) => {
  try {
    const fleets = await Fleet.findAll({
      where: { stationId: req.params.id }
    });
    res.json(fleets);
  } catch (error) {
    console.error('Error fetching station fleets:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create fleet
exports.createFleet = async (req, res) => {
  try {
    const { name, type, crewSize, capacity, stationId } = req.body;
    
    const fleet = await Fleet.create({
      name,
      type,
      crewSize,
      capacity,
      stationId,
      status: 'docked'
    });

    res.status(201).json(fleet);
  } catch (error) {
    console.error('Error creating fleet:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update fleet
exports.updateFleet = async (req, res) => {
  try {
    const fleet = await Fleet.findByPk(req.params.id);

    if (!fleet) {
      return res.status(404).json({ error: 'Fleet not found' });
    }

    await fleet.update(req.body);
    res.json(fleet);
  } catch (error) {
    console.error('Error updating fleet:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Deploy fleet on mission
exports.deployFleet = async (req, res) => {
  try {
    const fleet = await Fleet.findByPk(req.params.id);

    if (!fleet) {
      return res.status(404).json({ error: 'Fleet not found' });
    }

    const { missionType, destination } = req.body;

    if (fleet.status === 'active') {
      return res.status(400).json({ error: 'Fleet is already on mission' });
    }

    fleet.status = 'active';
    fleet.currentMission = missionType;
    fleet.missionDestination = destination;
    await fleet.save();

    res.json(fleet);
  } catch (error) {
    console.error('Error deploying fleet:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Return fleet from mission
exports.returnFleet = async (req, res) => {
  try {
    const fleet = await Fleet.findByPk(req.params.id);

    if (!fleet) {
      return res.status(404).json({ error: 'Fleet not found' });
    }

    fleet.status = 'returning';
    await fleet.save();

    // Simulate return delay and change to docked
    setTimeout(async () => {
      fleet.status = 'docked';
      fleet.currentMission = null;
      await fleet.save();
    }, 5000);

    res.json(fleet);
  } catch (error) {
    console.error('Error returning fleet:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete fleet
exports.deleteFleet = async (req, res) => {
  try {
    const fleet = await Fleet.findByPk(req.params.id);

    if (!fleet) {
      return res.status(404).json({ error: 'Fleet not found' });
    }

    if (fleet.status !== 'docked') {
      return res.status(400).json({ error: 'Cannot delete fleet while active' });
    }

    await fleet.destroy();
    res.json({ message: 'Fleet deleted successfully' });
  } catch (error) {
    console.error('Error deleting fleet:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get fleet statistics
exports.getFleetStats = async (req, res) => {
  try {
    const stats = await Fleet.findAll({
      attributes: [
        [sequelize.literal('type'), 'fleetType'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('crewSize')), 'totalCrew'],
        [sequelize.fn('SUM', sequelize.col('capacity')), 'totalCapacity']
      ],
      group: ['type']
    });

    const totalFleets = await Fleet.count();
    const activeFleets = await Fleet.count({ where: { status: 'active' } });

    res.json({
      stats,
      totalFleets,
      activeFleets,
      dockedFleets: totalFleets - activeFleets
    });
  } catch (error) {
    console.error('Error fetching fleet stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
