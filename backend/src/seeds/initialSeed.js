/**
 * Script para crear datos iniciales
 * Ejecutar con: node src/seeds/initialSeed.js
 */
require('dotenv').config();
const { sequelize, User, CustomerType, DiscountType, Category, StoreSettings } = require('../models');

async function seed() {
  try {
    await sequelize.sync({ force: false });
    console.log('Base de datos sincronizada.');

    // Crear configuración de tienda
    const [settings] = await StoreSettings.findOrCreate({
      where: { id: 1 },
      defaults: {
        storeName: 'BIJOU',
        currency: 'Q',
        lowStockAlert: true
      }
    });
    console.log('Configuración de tienda creada:', settings.storeName);

    // Crear usuario admin
    const [admin] = await User.findOrCreate({
      where: { email: 'admin@sistema.com' },
      defaults: {
        name: 'Administrador',
        email: 'admin@sistema.com',
        password: 'admin123',
        role: 'admin'
      }
    });
    console.log('Usuario admin creado:', admin.email);

    // Crear tipos de cliente
    const [general] = await CustomerType.findOrCreate({
      where: { name: 'General' },
      defaults: { name: 'General', description: 'Tipo genérico para descuentos' }
    });

    console.log('Tipo de cliente base creado.');

    // Crear tipos de descuento
    await DiscountType.findOrCreate({
      where: { name: 'Sin descuento' },
      defaults: { name: 'Sin descuento', percentage: 0, customerTypeId: general.id }
    });

    await DiscountType.findOrCreate({
      where: { name: 'Mayorista 10%' },
      defaults: { name: 'Mayorista 10%', percentage: 10, customerTypeId: general.id }
    });

    await DiscountType.findOrCreate({
      where: { name: 'Mayorista 15%' },
      defaults: { name: 'Mayorista 15%', percentage: 15, customerTypeId: general.id }
    });

    await DiscountType.findOrCreate({
      where: { name: 'Empleado 20%' },
      defaults: { name: 'Empleado 20%', percentage: 20, customerTypeId: general.id }
    });

    console.log('Tipos de descuento creados.');

    // Crear categorías de ejemplo
    await Category.findOrCreate({ where: { name: 'General' }, defaults: { name: 'General' } });
    await Category.findOrCreate({ where: { name: 'Electrónica' }, defaults: { name: 'Electrónica' } });
    await Category.findOrCreate({ where: { name: 'Ropa' }, defaults: { name: 'Ropa' } });
    await Category.findOrCreate({ where: { name: 'Alimentos' }, defaults: { name: 'Alimentos' } });

    console.log('Categorías creadas.');
    console.log('\n✓ Seed completado exitosamente');
    console.log('  Tienda: BIJOU');
    console.log('  Moneda: Quetzales (Q)');
    console.log('  Login: admin@sistema.com / admin123\n');

    process.exit(0);
  } catch (error) {
    console.error('Error en seed:', error);
    process.exit(1);
  }
}

seed();
