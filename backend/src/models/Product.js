const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    barcode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    sku: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0 }
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: { min: 0 }
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { min: 0 }
    },
    minStock: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
      comment: 'Stock mínimo para alertas'
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    unit: {
      type: DataTypes.STRING(20),
      defaultValue: 'unidad',
      comment: 'Unidad de medida: unidad, kg, litro, metro, etc.'
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'products',
    timestamps: true
  });

  return Product;
};
