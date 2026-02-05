module.exports = (sequelize, DataTypes) => {
  const Contract = sequelize.define('Contract', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    stationId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    resourceId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM(['buy', 'sell', 'lease']),
      allowNull: false
    },
    quantity: {
      type: DataTypes.DECIMAL(20, 6),
      allowNull: false
    },
    unitPrice: {
      type: DataTypes.DECIMAL(20, 6),
      allowNull: false
    },
    totalPrice: {
      type: DataTypes.DECIMAL(20, 6),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM(['pending', 'active', 'completed', 'cancelled']),
      defaultValue: 'pending'
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    terms: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'contracts',
    timestamps: true
  });

  return Contract;
};
