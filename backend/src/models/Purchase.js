const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Purchase = sequelize.define('Purchase', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    purchaseNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    supplier: {
      type: DataTypes.STRING(200),
      allowNull: true,
      defaultValue: 'Proveedor General'
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Usuario que registró la compra'
    },
    total: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('completada', 'anulada'),
      defaultValue: 'completada'
    }
  }, {
    tableName: 'purchases',
    timestamps: true
  });

  return Purchase;
};
