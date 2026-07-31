const { Product, Category, Sequelize } = require('../models');
const { Op, col } = Sequelize;

const getLowStockAlerts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: {
        active: true,
        stock: { [Op.lte]: col('minStock') }
      },
      include: [{ model: Category, attributes: ['id', 'name'] }],
      order: [['stock', 'ASC']]
    });

    res.json({
      count: products.length,
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        barcode: p.barcode,
        stock: p.stock,
        minStock: p.minStock,
        category: p.Category?.name || 'Sin categoría',
        urgency: p.stock === 0 ? 'agotado' : 'bajo'
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener alertas', details: error.message });
  }
};

module.exports = { getLowStockAlerts };
