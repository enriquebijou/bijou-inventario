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

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar:', error);
    process.exit(1);
  }
}

start();
