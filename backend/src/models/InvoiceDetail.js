const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const InvoiceDetail = sequelize.define('InvoiceDetail', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    invoiceId: {
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
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Precio unitario al momento de la venta'
    },
    discountTypeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Tipo de descuento aplicado'
    },
    discountPercentage: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
      comment: 'Porcentaje de descuento aplicado'
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: 'Monto del descuento'
    },
    lineTotal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      comment: 'Total de la línea después de descuento'
    }
  }, {
    tableName: 'invoice_details',
    timestamps: true
  });

  return InvoiceDetail;
};
