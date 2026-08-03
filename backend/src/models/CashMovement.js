const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CashMovement = sequelize.define('CashMovement', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    cashRegisterId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('venta', 'retiro', 'ingreso'),
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    referenceId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID de factura si es venta'
    }
  }, {
    tableName: 'cash_movements',
    timestamps: true
  });

  return CashMovement;
};
