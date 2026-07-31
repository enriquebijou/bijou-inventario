const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Invoice = sequelize.define('Invoice', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    invoiceNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    customerName: {
      type: DataTypes.STRING(200),
      allowNull: true,
      defaultValue: 'Cliente General'
    },
    customerTypeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Tipo de cliente para aplicar descuentos'
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Vendedor que realizó la venta'
    },
    subtotal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0
    },
    totalDiscount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0
    },
    tax: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0
    },
    total: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM('pendiente', 'completada', 'anulada'),
      defaultValue: 'completada'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'invoices',
    timestamps: true
  });

  return Invoice;
};
