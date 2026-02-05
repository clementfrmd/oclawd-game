const { Contract, Resource } = require('../models');

// Get all contracts
exports.getAllContracts = async (req, res) => {
  try {
    const contracts = await Contract.findAll({
      include: [{ model: Resource, as: 'resource' }]
    });
    res.json(contracts);
  } catch (error) {
    console.error('Error fetching contracts:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get contract by ID
exports.getContract = async (req, res) => {
  try {
    const contract = await Contract.findByPk(req.params.id, {
      include: [{ model: Resource, as: 'resource' }]
    });

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    res.json(contract);
  } catch (error) {
    console.error('Error fetching contract:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get contracts by station
exports.getContractsByStation = async (req, res) => {
  try {
    const contracts = await Contract.findAll({
      where: { stationId: req.params.id },
      include: [{ model: Resource, as: 'resource' }]
    });
    res.json(contracts);
  } catch (error) {
    console.error('Error fetching station contracts:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create contract
exports.createContract = async (req, res) => {
  try {
    const { stationId, resourceId, type, quantity, unitPrice, startDate, endDate, terms } = req.body;
    
    const totalPrice = parseFloat(quantity) * parseFloat(unitPrice);
    
    const contract = await Contract.create({
      stationId,
      resourceId,
      type,
      quantity,
      unitPrice,
      totalPrice,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      terms
    });

    res.status(201).json(contract);
  } catch (error) {
    console.error('Error creating contract:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update contract
exports.updateContract = async (req, res) => {
  try {
    const contract = await Contract.findByPk(req.params.id);

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    if (contract.status === 'completed' || contract.status === 'cancelled') {
      return res.status(400).json({ error: 'Cannot modify completed or cancelled contract' });
    }

    await contract.update(req.body);
    res.json(contract);
  } catch (error) {
    console.error('Error updating contract:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Cancel contract
exports.cancelContract = async (req, res) => {
  try {
    const contract = await Contract.findByPk(req.params.id);

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    contract.status = 'cancelled';
    await contract.save();

    res.json({ message: 'Contract cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling contract:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Accept contract
exports.acceptContract = async (req, res) => {
  try {
    const contract = await Contract.findByPk(req.params.id);

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    if (contract.status !== 'pending') {
      return res.status(400).json({ error: 'Contract is not pending' });
    }

    contract.status = 'active';
    await contract.save();

    res.json(contract);
  } catch (error) {
    console.error('Error accepting contract:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Complete contract
exports.completeContract = async (req, res) => {
  try {
    const contract = await Contract.findByPk(req.params.id);

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    contract.status = 'completed';
    await contract.save();

    res.json({ message: 'Contract completed successfully' });
  } catch (error) {
    console.error('Error completing contract:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
