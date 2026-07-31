const { Sequelize } = require('sequelize');
const path = require('path');

let sequelize;

if (process.env.DATABASE_URL) {
  // Producción: PostgreSQL (Neon/Render)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false }
    },
    logging: false
  });
} else {
  // Desarrollo local: SQLite
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', '..', 'database.sqlite'),
    logging: false
  });
}

// Importar modelos
const User = require('./User')(sequelize);
const Category = require('./Category')(sequelize);
const Product = require('./Product')(sequelize);
const CustomerType = require('./CustomerType')(sequelize);
const DiscountType = require('./DiscountType')(sequelize);
const Invoice = require('./Invoice')(sequelize);
const InvoiceDetail = require('./InvoiceDetail')(sequelize);
const InventoryMovement = require('./InventoryMovement')(sequelize);
const Purchase = require('./Purchase')(sequelize);
const PurchaseDetail = require('./PurchaseDetail')(sequelize);
const StoreSettings = require('./StoreSettings')(sequelize);

// Relaciones

// Categorías -> Productos
Category.hasMany(Product, { foreignKey: 'categoryId' });
Product.belongsTo(Category, { foreignKey: 'categoryId' });

// Tipos de descuento -> Tipos de cliente
CustomerType.hasMany(DiscountType, { foreignKey: 'customerTypeId' });
DiscountType.belongsTo(CustomerType, { foreignKey: 'customerTypeId' });

// Facturas
User.hasMany(Invoice, { foreignKey: 'userId', as: 'invoices' });
Invoice.belongsTo(User, { foreignKey: 'userId', as: 'seller' });

CustomerType.hasMany(Invoice, { foreignKey: 'customerTypeId' });
Invoice.belongsTo(CustomerType, { foreignKey: 'customerTypeId' });

// Detalle de factura
Invoice.hasMany(InvoiceDetail, { foreignKey: 'invoiceId', as: 'details' });
InvoiceDetail.belongsTo(Invoice, { foreignKey: 'invoiceId' });

Product.hasMany(InvoiceDetail, { foreignKey: 'productId' });
InvoiceDetail.belongsTo(Product, { foreignKey: 'productId' });

DiscountType.hasMany(InvoiceDetail, { foreignKey: 'discountTypeId' });
InvoiceDetail.belongsTo(DiscountType, { foreignKey: 'discountTypeId' });

// Movimientos de inventario
Product.hasMany(InventoryMovement, { foreignKey: 'productId' });
InventoryMovement.belongsTo(Product, { foreignKey: 'productId' });

User.hasMany(InventoryMovement, { foreignKey: 'userId' });
InventoryMovement.belongsTo(User, { foreignKey: 'userId' });

// Compras
User.hasMany(Purchase, { foreignKey: 'userId', as: 'purchases' });
Purchase.belongsTo(User, { foreignKey: 'userId', as: 'registeredBy' });

Purchase.hasMany(PurchaseDetail, { foreignKey: 'purchaseId', as: 'details' });
PurchaseDetail.belongsTo(Purchase, { foreignKey: 'purchaseId' });

Product.hasMany(PurchaseDetail, { foreignKey: 'productId' });
PurchaseDetail.belongsTo(Product, { foreignKey: 'productId' });

module.exports = {
  sequelize,
  Sequelize,
  User,
  Category,
  Product,
  CustomerType,
  DiscountType,
  Invoice,
  InvoiceDetail,
  InventoryMovement,
  Purchase,
  PurchaseDetail,
  StoreSettings
};
