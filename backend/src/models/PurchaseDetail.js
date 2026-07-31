const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PurchaseDetail = sequelize.define('PurchaseDetail', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    purchaseId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 }
    },
    unitCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Costo unitario de compra'
    },
    lineTotal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      comment: 'quantity * unitCost'
    }
  }, {
    tableName: 'purchase_details',
    timestamps: true
  });

  return PurchaseDetail;
};
