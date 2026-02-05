module.exports = (sequelize, DataTypes) => {
  const Marketplace = sequelize.define('Marketplace', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    resourceType: {
      type: DataTypes.ENUM(['mineral', 'energy', 'rare-earth', 'organic', 'data']),
      allowNull: false
    },
    basePrice: {
      type: DataTypes.DECIMAL(20, 6),
      allowNull: false
    },
    volatility: {
      type: DataTypes.DECIMAL(5, 4),
      defaultValue: 0.1
    },
    spread: {
      type: DataTypes.DECIMAL(5, 4),
      defaultValue: 0.02
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'marketplaces',
    timestamps: true
  });

  return Marketplace;
};
