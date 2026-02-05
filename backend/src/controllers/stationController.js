const { Station, Resource, Contract, Fleet } = require('../models');

// Get all stations
exports.getAllStations = async (req, res) => {
  try {
    const stations = await Station.findAll({
      where: { active: true },
      include: [
        { model: Resource, as: 'resources' },
        { model: Fleet, as: 'fleets' }
      ]
    });
    res.json(stations);
  } catch (error) {
    console.error('Error fetching stations:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get station by ID
exports.getStation = async (req, res) => {
  try {
    const station = await Station.findByPk(req.params.id, {
      include: [
        { model: Resource, as: 'resources' },
        { model: Fleet, as: 'fleets' }
      ]
    });

    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }

    res.json(station);
  } catch (error) {
    console.error('Error fetching station:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create new station
exports.createStation = async (req, res) => {
  try {
    const { name, location, description } = req.body;
    
    const station = await Station.create({
      name,
      location,
      description,
      owner: 'player' // Default owner for demo
    });

    res.status(201).json(station);
  } catch (error) {
    console.error('Error creating station:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update station
exports.updateStation = async (req, res) => {
  try {
    const station = await Station.findByPk(req.params.id);

    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }

    await station.update(req.body);
    res.json(station);
  } catch (error) {
    console.error('Error updating station:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete station
exports.deleteStation = async (req, res) => {
  try {
    const station = await Station.findByPk(req.params.id);

    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }

    await station.destroy();
    res.json({ message: 'Station deleted successfully' });
  } catch (error) {
    console.error('Error deleting station:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get station resources
exports.getStationResources = async (req, res) => {
  try {
    const resources = await Resource.findAll({
      where: { stationId: req.params.id }
    });
    res.json(resources);
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get station contracts
exports.getStationContracts = async (req, res) => {
  try {
    const contracts = await Contract.findAll({
      where: { stationId: req.params.id },
      include: [{ model: Resource, as: 'resource' }]
    });
    res.json(contracts);
  } catch (error) {
    console.error('Error fetching contracts:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get station fleets
exports.getStationFleets = async (req, res) => {
  try {
    const fleets = await Fleet.findAll({
      where: { stationId: req.params.id }
    });
    res.json(fleets);
  } catch (error) {
    console.error('Error fetching fleets:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
