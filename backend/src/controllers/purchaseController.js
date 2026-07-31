const { Purchase, PurchaseDetail, Product, InventoryMovement, User, sequelize, Sequelize } = require('../models');
const { Op } = Sequelize;

// Generar número de compra
async function generatePurchaseNumber() {
  const today = new Date();
  const prefix = `C${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;
  
  const lastPurchase = await Purchase.findOne({
    where: { purchaseNumber: { [Op.like]: `${prefix}%` } },
    order: [['purchaseNumber', 'DESC']]
  });

  let sequence = 1;
  if (lastPurchase) {
    const lastSeq = parseInt(lastPurchase.purchaseNumber.slice(-5));
    sequence = lastSeq + 1;
  }

  return `${prefix}${String(sequence).padStart(5, '0')}`;
}

const getAll = async (req, res) => {
  try {
    const purchases = await Purchase.findAll({
      include: [
        { model: User, as: 'registeredBy', attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener compras', details: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const purchase = await Purchase.findByPk(req.params.id, {
      include: [
        { model: User, as: 'registeredBy', attributes: ['id', 'name'] },
        {
          model: PurchaseDetail,
          as: 'details',
          include: [{ model: Product, attributes: ['id', 'name', 'barcode', 'cost', 'stock'] }]
        }
      ]
    });

    if (!purchase) {
      return res.status(404).json({ error: 'Compra no encontrada' });
    }

    res.json(purchase);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener compra', details: error.message });
  }
};

const create = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { supplier, items, notes } = req.body;
    // items: [{ productId, quantity, unitCost }]

    if (!items || items.length === 0) {
      await t.rollback();
      return res.status(400).json({ error: 'La compra debe tener al menos un producto' });
    }

    const purchaseNumber = await generatePurchaseNumber();
    let total = 0;
    const detailsData = [];

    for (const item of items) {
      const product = await Product.findByPk(item.productId, { transaction: t });
      if (!product) {
        await t.rollback();
        return res.status(400).json({ error: `Producto con ID ${item.productId} no encontrado` });
      }

      const lineTotal = parseFloat(item.unitCost) * item.quantity;
      total += lineTotal;

      detailsData.push({
        productId: product.id,
        quantity: item.quantity,
        unitCost: item.unitCost,
        lineTotal
      });

      // Calcular costo promedio ponderado
      // Formula: (costoActual * stockActual + costoNuevo * cantidadNueva) / (stockActual + cantidadNueva)
      const currentStock = product.stock;
      const currentCost = parseFloat(product.cost) || 0;
      const newQuantity = item.quantity;
      const newCost = parseFloat(item.unitCost);

      let weightedAverageCost;
      if (currentStock + newQuantity > 0) {
        weightedAverageCost = ((currentCost * currentStock) + (newCost * newQuantity)) / (currentStock + newQuantity);
      } else {
        weightedAverageCost = newCost;
      }

      const previousStock = currentStock;
      const newStock = currentStock + newQuantity;

      // Actualizar producto: stock y costo promedio
      await product.update({
        stock: newStock,
        cost: Math.round(weightedAverageCost * 100) / 100
      }, { transaction: t });

      // Registrar movimiento de inventario
      await InventoryMovement.create({
        productId: product.id,
        userId: req.user.id,
        type: 'entrada',
        quantity: newQuantity,
        previousStock,
        newStock,
        reason: `Compra - ${purchaseNumber} (Proveedor: ${supplier || 'General'})`
      }, { transaction: t });
    }

    // Crear compra
    const purchase = await Purchase.create({
      purchaseNumber,
      supplier: supplier || 'Proveedor General',
      userId: req.user.id,
      total,
      notes,
      status: 'completada'
    }, { transaction: t });

    // Crear detalles
    for (const detail of detailsData) {
      await PurchaseDetail.create({
        purchaseId: purchase.id,
        ...detail
      }, { transaction: t });
    }

    await t.commit();

    // Retornar compra completa
    const fullPurchase = await Purchase.findByPk(purchase.id, {
      include: [
        { model: User, as: 'registeredBy', attributes: ['id', 'name'] },
        {
          model: PurchaseDetail,
          as: 'details',
          include: [{ model: Product, attributes: ['id', 'name', 'barcode', 'cost', 'stock'] }]
        }
      ]
    });

    res.status(201).json(fullPurchase);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: 'Error al crear compra', details: error.message });
  }
};

const cancel = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const purchase = await Purchase.findByPk(req.params.id, {
      include: [{ model: PurchaseDetail, as: 'details' }]
    });

    if (!purchase) {
      await t.rollback();
      return res.status(404).json({ error: 'Compra no encontrada' });
    }

    if (purchase.status === 'anulada') {
      await t.rollback();
      return res.status(400).json({ error: 'La compra ya está anulada' });
    }

    // Devolver stock
    for (const detail of purchase.details) {
      const product = await Product.findByPk(detail.productId, { transaction: t });
      const previousStock = product.stock;
      const newStock = previousStock - detail.quantity;

      if (newStock < 0) {
        await t.rollback();
        return res.status(400).json({ 
          error: `No se puede anular: el producto "${product.name}" no tiene suficiente stock para devolver` 
        });
      }

      await product.update({ stock: newStock }, { transaction: t });

      await InventoryMovement.create({
        productId: product.id,
        userId: req.user.id,
        type: 'salida',
        quantity: detail.quantity,
        previousStock,
        newStock,
        reason: `Anulación de compra ${purchase.purchaseNumber}`
      }, { transaction: t });
    }

    await purchase.update({ status: 'anulada' }, { transaction: t });

    await t.commit();
    res.json({ message: 'Compra anulada y stock devuelto' });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: 'Error al anular compra', details: error.message });
  }
};

module.exports = { getAll, getById, create, cancel };
