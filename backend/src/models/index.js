const sequelize = require('../config/database');

// Import models
const Station = require('./Station');
const Resource = require('./Resource');
const Marketplace = require('./Marketplace');
const Fleet = require('./Fleet');
const Contract = require('./Contract');

// Define relationships
Station.hasMany(Resource, { foreignKey: 'stationId', as: 'resources' });
Resource.belongsTo(Station, { foreignKey: 'stationId', as: 'station' });

Station.hasMany(Contract, { foreignKey: 'stationId', as: 'contracts' });
Contract.belongsTo(Station, { foreignKey: 'stationId', as: 'station' });

Resource.hasMany(Contract, { foreignKey: 'resourceId', as: 'contracts' });
Contract.belongsTo(Resource, { foreignKey: 'resourceId', as: 'resource' });

Station.hasMany(Fleet, { foreignKey: 'stationId', as: 'fleets' });
Fleet.belongsTo(Station, { foreignKey: 'stationId', as: 'station' });

module.exports = {
  sequelize,
  Station,
  Resource,
  Marketplace,
  Fleet,
  Contract
};
