const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Import model definitions
const StationModel = require('./Station');
const ResourceModel = require('./Resource');
const MarketplaceModel = require('./Marketplace');
const FleetModel = require('./Fleet');
const ContractModel = require('./Contract');
const AgentModel = require('./Agent');
const PlayerFacilityModel = require('./PlayerFacility');
const PlayerResearchModel = require('./PlayerResearch');
const PlayerDefenseModel = require('./PlayerDefense');
const PlayerResourcesModel = require('./PlayerResources');

// Initialize models
const Station = StationModel(sequelize, DataTypes);
const Resource = ResourceModel(sequelize, DataTypes);
const Marketplace = MarketplaceModel(sequelize, DataTypes);
const Fleet = FleetModel(sequelize, DataTypes);
const Contract = ContractModel(sequelize, DataTypes);
const Agent = AgentModel(sequelize, DataTypes);
const PlayerFacility = PlayerFacilityModel(sequelize, DataTypes);
const PlayerResearch = PlayerResearchModel(sequelize, DataTypes);
const PlayerDefense = PlayerDefenseModel(sequelize, DataTypes);
const PlayerResources = PlayerResourcesModel(sequelize, DataTypes);

// Define relationships
Station.hasMany(Resource, { foreignKey: 'stationId', as: 'resources' });
Resource.belongsTo(Station, { foreignKey: 'stationId', as: 'station' });

Station.hasMany(Contract, { foreignKey: 'stationId', as: 'contracts' });
Contract.belongsTo(Station, { foreignKey: 'stationId', as: 'station' });

Resource.hasMany(Contract, { foreignKey: 'resourceId', as: 'contracts' });
Contract.belongsTo(Resource, { foreignKey: 'resourceId', as: 'resource' });

Station.hasMany(Fleet, { foreignKey: 'stationId', as: 'fleets' });
Fleet.belongsTo(Station, { foreignKey: 'stationId', as: 'station' });

// Agent relationships
Agent.belongsTo(Station, { foreignKey: 'stationId', as: 'homeStation' });
Station.hasOne(Agent, { foreignKey: 'stationId', as: 'agent' });

module.exports = {
  sequelize,
  Sequelize,
  Station,
  Resource,
  Marketplace,
  Fleet,
  Contract,
  Agent,
  PlayerFacility,
  PlayerResearch,
  PlayerDefense,
  PlayerResources
};
