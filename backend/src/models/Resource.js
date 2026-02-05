module.exports = (sequelize, DataTypes) => {
  const Resource = sequelize.define('Resource', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    type: {
      type: DataTypes.ENUM(['mineral', 'energy', 'rare-earth', 'organic', 'data']),
      allowNull: false
    },
    quantity: {
      type: DataTypes.DECIMAL(20, 6),
      defaultValue: 0,
      allowNull: false
    },
    unitPrice: {
      type: DataTypes.DECIMAL(20, 6),
      defaultValue: 0,
      allowNull: false
    },
    marketId: {
      type: DataTypes.UUID,
      allowNull: true
    }
  }, {
    tableName: 'resources',
    timestamps: true
  });

  return Resource;
};
