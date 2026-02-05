const jwt = require('jsonwebtoken');
const { Station } = require('../models');

// Middleware to verify JWT token
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No authentication token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const station = await Station.findOne({ where: { id: decoded.stationId } });

    if (!station) {
      return res.status(401).json({ error: 'Station not found' });
    }

    if (decoded.stationId !== station.id) {
      return res.status(403).json({ error: 'Invalid token' });
    }

    req.station = station;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Invalid authentication token' });
  }
};

module.exports = { auth };
