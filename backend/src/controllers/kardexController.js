const { Product, InventoryMovement, User } = require('../models');

const getKardex = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const movements = await InventoryMovement.findAll({
      where: { productId: id },
      include: [{ model: User, attributes: ['id', 'name'] }],
      order: [['createdAt', 'ASC']]
    });

    res.json({
      product: {
        id: product.id,
        name: product.name,
        barcode: product.barcode,
        currentStock: product.stock,
        cost: product.cost
      },
      movements: movements.map(m => ({
        id: m.id,
        date: m.createdAt,
        type: m.type,
        quantity: m.quantity,
        previousStock: m.previousStock,
        newStock: m.newStock,
        reason: m.reason,
        user: m.User?.name || '-'
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener kardex', details: error.message });
  }
};

module.exports = { getKardex };
