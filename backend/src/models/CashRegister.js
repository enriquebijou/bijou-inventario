const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CashRegister = sequelize.define('CashRegister', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    openedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Usuario que abrió la caja'
    },
    closedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Usuario que cerró la caja'
    },
    openingAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Monto inicial al abrir caja'
    },
    salesTotal: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      comment: 'Total de ventas durante la sesión'
    },
    withdrawals: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      comment: 'Total de retiros/salidas de efectivo'
    },
    expectedAmount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      comment: 'Lo que debería haber (apertura + ventas - retiros)'
    },
    actualAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      comment: 'Lo que realmente hay al cerrar (conteo real)'
    },
    difference: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      comment: 'Diferencia: actual - esperado (sobrante/faltante)'
    },
    status: {
      type: DataTypes.ENUM('abierta', 'cerrada'),
      defaultValue: 'abierta'
    },
    closedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'cash_registers',
    timestamps: true
  });

  return CashRegister;
};
