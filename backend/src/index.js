require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Endpoint público para nombre de tienda (se usa en login)
app.get('/api/public/store-info', async (req, res) => {
  try {
    const { StoreSettings } = require('./models');
    let settings = await StoreSettings.findOne();
    if (!settings) {
      settings = { storeName: 'Mi Tienda', currency: 'Q' };
    }
    res.json({ storeName: settings.storeName, currency: settings.currency });
  } catch (error) {
    res.json({ storeName: 'Mi Tienda', currency: 'Q' });
  }
});

// Iniciar servidor
async function start() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a base de datos establecida.');
    
    // Sincronizar modelos (crear tablas si no existen)
    await sequelize.sync();
    console.log('Modelos sincronizados.');

    // Auto-seed: si no hay usuarios, crear datos iniciales
    const { User, CustomerType, DiscountType, Category, StoreSettings } = require('./models');
    const userCount = await User.count();
    if (userCount === 0) {
      console.log('Base de datos vacía, ejecutando seed automático...');
      
      await StoreSettings.findOrCreate({
        where: { id: 1 },
        defaults: { storeName: 'BIJOU', currency: 'Q', lowStockAlert: true }
      });

      await User.create({
        name: 'Administrador',
        email: 'admin@sistema.com',
        password: 'admin123',
        role: 'admin'
      });

      const [general] = await CustomerType.findOrCreate({
        where: { name: 'General' },
        defaults: { name: 'General', description: 'Tipo genérico' }
      });

      await DiscountType.findOrCreate({ where: { name: 'Mayorista 10%' }, defaults: { name: 'Mayorista 10%', percentage: 10, customerTypeId: general.id } });
      await DiscountType.findOrCreate({ where: { name: 'Mayorista 15%' }, defaults: { name: 'Mayorista 15%', percentage: 15, customerTypeId: general.id } });
      await DiscountType.findOrCreate({ where: { name: 'Empleado 20%' }, defaults: { name: 'Empleado 20%', percentage: 20, customerTypeId: general.id } });

      await Category.findOrCreate({ where: { name: 'General' } });
      await Category.findOrCreate({ where: { name: 'Electrónica' } });
      await Category.findOrCreate({ where: { name: 'Ropa' } });
      await Category.findOrCreate({ where: { name: 'Alimentos' } });

      console.log('Seed automático completado. Login: admin@sistema.com / admin123');
    }

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar:', error);
    process.exit(1);
  }
}

start();
