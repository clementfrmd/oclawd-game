const { Resource } = require('../models');

// Get all resources
exports.getAllResources = async (req, res) => {
  try {
    const resources = await Resource.findAll();
    res.json(resources);
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get resource by ID
exports.getResource = async (req, res) => {
  try {
    const resource = await Resource.findByPk(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    res.json(resource);
  } catch (error) {
    console.error('Error fetching resource:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get resources by station
exports.getResourcesByStation = async (req, res) => {
  try {
    const resources = await Resource.findAll({
      where: { stationId: req.params.id }
    });
    res.json(resources);
  } catch (error) {
    console.error('Error fetching station resources:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get resources by type
exports.getResourcesByType = async (req, res) => {
  try {
    const resources = await Resource.findAll({
      where: { type: req.params.type }
    });
    res.json(resources);
  } catch (error) {
    console.error('Error fetching resources by type:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create resource
exports.createResource = async (req, res) => {
  try {
    const { name, type, quantity, unitPrice, marketId } = req.body;
    
    const resource = await Resource.create({
      name,
      type,
      quantity,
      unitPrice,
      marketId,
      stationId: req.params.id
    });

    res.status(201).json(resource);
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update resource
exports.updateResource = async (req, res) => {
  try {
    const resource = await Resource.findByPk(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    await resource.update(req.body);
    res.json(resource);
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Transfer resource between stations
exports.transferResource = async (req, res) => {
  try {
    const { fromStationId, toStationId, resourceId, quantity } = req.body;
    
    const fromResource = await Resource.findOne({
      where: { id: resourceId, stationId: fromStationId }
    });

    const toResource = await Resource.findOne({
      where: { name: fromResource.name, stationId: toStationId }
    });

    if (!fromResource || fromResource.quantity < quantity) {
      return res.status(400).json({ error: 'Insufficient quantity' });
    }

    // Deduct from source
    fromResource.quantity -= quantity;
    await fromResource.save();

    // Add to destination or create new
    if (toResource) {
      toResource.quantity += quantity;
      await toResource.save();
    } else {
      await Resource.create({
        name: fromResource.name,
        type: fromResource.type,
        quantity,
        unitPrice: fromResource.unitPrice,
        stationId: toStationId
      });
    }

    res.json({ message: 'Resource transferred successfully' });
  } catch (error) {
    console.error('Error transferring resource:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
