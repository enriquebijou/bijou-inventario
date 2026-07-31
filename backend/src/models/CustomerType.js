const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CustomerType = sequelize.define('CustomerType', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      comment: 'Ej: Mayorista, Minorista, Empleado, VIP'
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'customer_types',
    timestamps: true
  });

  return CustomerType;
};
