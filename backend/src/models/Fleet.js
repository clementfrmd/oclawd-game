module.exports = (sequelize, DataTypes) => {
  const Fleet = sequelize.define('Fleet', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    stationId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM(['explorer', 'transport', 'fighter', 'mining']),
      allowNull: false
    },
    crewSize: {
      type: DataTypes.INTEGER,
      defaultValue: 100
    },
    capacity: {
      type: DataTypes.INTEGER,
      defaultValue: 100
    },
    status: {
      type: DataTypes.ENUM(['docked', 'active', 'returning']),
      defaultValue: 'docked'
    },
    currentMission: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'fleets',
    timestamps: true
  });

  Fleet.associate = (models) => {
    Fleet.belongsTo(models.Station, {
      foreignKey: 'stationId',
      as: 'station'
    });
  };

  return Fleet;
};
