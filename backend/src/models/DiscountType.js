const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DiscountType = sequelize.define('DiscountType', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Ej: Descuento Mayorista, Descuento Empleado, Promo Navidad'
    },
    percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      validate: { min: 0, max: 100 },
      comment: 'Porcentaje de descuento (0-100)'
    },
    customerTypeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Tipo de cliente al que aplica este descuento'
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'discount_types',
    timestamps: true
  });

  return DiscountType;
};
