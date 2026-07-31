const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const InventoryMovement = sequelize.define('InventoryMovement', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('entrada', 'salida', 'ajuste'),
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    previousStock: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    newStock: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    reason: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Razón del movimiento: venta, compra, ajuste manual, etc.'
    },
    referenceId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID de factura u otra referencia'
    }
  }, {
    tableName: 'inventory_movements',
    timestamps: true
  });

  return InventoryMovement;
};
