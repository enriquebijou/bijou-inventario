const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const StoreSettings = sequelize.define('StoreSettings', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    storeName: {
      type: DataTypes.STRING(200),
      allowNull: false,
      defaultValue: 'Mi Tienda'
    },
    address: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    currency: {
      type: DataTypes.STRING(10),
      defaultValue: 'Q',
      comment: 'Símbolo de moneda (Q para Quetzales)'
    },
    lowStockAlert: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'store_settings',
    timestamps: true
  });

  return StoreSettings;
};
