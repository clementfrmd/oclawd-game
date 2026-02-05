const { Marketplace, Resource } = require('../models');

// Get all marketplaces
exports.getAllMarketplaces = async (req, res) => {
  try {
    const marketplaces = await Marketplace.findAll({
      where: { active: true }
    });
    res.json(marketplaces);
  } catch (error) {
    console.error('Error fetching marketplaces:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get marketplace by type
exports.getMarketplaceByType = async (req, res) => {
  try {
    const marketplace = await Marketplace.findOne({
      where: { resourceType: req.params.type, active: true }
    });

    if (!marketplace) {
      return res.status(404).json({ error: 'Marketplace not found' });
    }

    // Update current price based on volatility
    const currentPrice = await calculatePrice(marketplace);
    marketplace.currentPrice = currentPrice;
    await marketplace.save();

    res.json(marketplace);
  } catch (error) {
    console.error('Error fetching marketplace:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get market data
exports.getMarketData = async (req, res) => {
  try {
    const { type } = req.params;
    const marketplace = await Marketplace.findOne({
      where: { resourceType: type, active: true }
    });

    if (!marketplace) {
      return res.status(404).json({ error: 'Marketplace not found' });
    }

    // Get recent prices and trading volume
    const resources = await Resource.findAll({
      where: { type, marketId: marketplace.id }
    });

    const marketData = {
      marketplace,
      resources,
      currentPrice: marketplace.basePrice,
      volatility: marketplace.volatility,
      spread: marketplace.spread
    };

    res.json(marketData);
  } catch (error) {
    console.error('Error fetching market data:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Buy resource from marketplace
exports.buyResource = async (req, res) => {
  try {
    const { type, quantity } = req.body;
    const stationId = req.params.stationId;

    const marketplace = await Marketplace.findOne({
      where: { resourceType: type, active: true }
    });

    if (!marketplace) {
      return res.status(404).json({ error: 'Marketplace not found' });
    }

    // Check if resource exists
    let resource = await Resource.findOne({
      where: { type, marketId: marketplace.id }
    });

    if (resource) {
      // Update existing resource
      resource.quantity += quantity;
      resource.unitPrice = await calculatePrice(marketplace);
      await resource.save();
    } else {
      // Create new resource
      resource = await Resource.create({
        name: `${type}-${Date.now()}`,
        type,
        quantity,
        unitPrice: await calculatePrice(marketplace),
        marketId: marketplace.id
      });
    }

    res.status(201).json(resource);
  } catch (error) {
    console.error('Error buying resource:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Sell resource to marketplace
exports.sellResource = async (req, res) => {
  try {
    const { type, quantity, stationId } = req.body;

    const marketplace = await Marketplace.findOne({
      where: { resourceType: type, active: true }
    });

    if (!marketplace) {
      return res.status(404).json({ error: 'Marketplace not found' });
    }

    // Find resource to sell
    const resource = await Resource.findOne({
      where: { type, marketId: marketplace.id }
    });

    if (!resource || resource.quantity < quantity) {
      return res.status(400).json({ error: 'Insufficient resource quantity' });
    }

    // Remove resource
    resource.quantity -= quantity;
    if (resource.quantity === 0) {
      await resource.destroy();
    } else {
      await resource.save();
    }

    res.json({ message: 'Resource sold successfully' });
  } catch (error) {
    console.error('Error selling resource:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update marketplace prices
exports.updatePrices = async (req, res) => {
  try {
    const marketplaces = await Marketplace.findAll({
      where: { active: true }
    });

    for (const marketplace of marketplaces) {
      marketplace.currentPrice = await calculatePrice(marketplace);
      await marketplace.save();
    }

    res.json({ message: 'Market prices updated successfully' });
  } catch (error) {
    console.error('Error updating prices:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Calculate price with volatility
const calculatePrice = async (marketplace) => {
  const variance = marketplace.basePrice * marketplace.volatility;
  const randomFactor = 1 + (Math.random() * variance - variance / 2);
  const spread = marketplace.spread / 2;
  return Math.max(0, marketplace.basePrice * randomFactor - spread);
};
