const { StoreSettings } = require('../models');

const getSettings = async (req, res) => {
  try {
    let settings = await StoreSettings.findOne();
    
    // Si no existe, crear con valores por defecto
    if (!settings) {
      settings = await StoreSettings.create({
        storeName: 'Mi Tienda',
        currency: 'Q',
        lowStockAlert: true
      });
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener configuración', details: error.message });
  }
};

const updateSettings = async (req, res) => {
  try {
    let settings = await StoreSettings.findOne();
    
    if (!settings) {
      settings = await StoreSettings.create(req.body);
    } else {
      const { storeName, address, phone, currency, lowStockAlert } = req.body;
      await settings.update({ storeName, address, phone, currency, lowStockAlert });
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar configuración', details: error.message });
  }
};

module.exports = { getSettings, updateSettings };
