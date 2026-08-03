const { Invoice, InvoiceDetail, Product, CustomerType, DiscountType, InventoryMovement, User, sequelize, Sequelize } = require('../models');
const { Op } = Sequelize;
const { registerSale } = require('./cashController');

// Generar número de factura
async function generateInvoiceNumber() {
  const today = new Date();
  const prefix = `F${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;
  
  const lastInvoice = await Invoice.findOne({
    where: { invoiceNumber: { [Op.like]: `${prefix}%` } },
    order: [['invoiceNumber', 'DESC']]
  });

  let sequence = 1;
  if (lastInvoice) {
    const lastSeq = parseInt(lastInvoice.invoiceNumber.slice(-5));
    sequence = lastSeq + 1;
  }

  return `${prefix}${String(sequence).padStart(5, '0')}`;
}

const getAll = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    const where = {};

    if (status) where.status = status;
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.createdAt = {
        [Op.between]: [start, end]
      };
    }

    const invoices = await Invoice.findAll({
      where,
      include: [
        { model: User, as: 'seller', attributes: ['id', 'name'] },
        { model: CustomerType, attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener facturas', details: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, {
      include: [
        { model: User, as: 'seller', attributes: ['id', 'name'] },
        { model: CustomerType, attributes: ['id', 'name'] },
        {
          model: InvoiceDetail,
          as: 'details',
          include: [
            { model: Product, attributes: ['id', 'name', 'barcode'] },
            { model: DiscountType, attributes: ['id', 'name'] }
          ]
        }
      ]
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener factura', details: error.message });
  }
};

const create = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { customerName, customerTypeId, items, notes } = req.body;
    // items: [{ productId, quantity, discountTypeId }]

    if (!items || items.length === 0) {
      await t.rollback();
      return res.status(400).json({ error: 'La factura debe tener al menos un producto' });
    }

    const invoiceNumber = await generateInvoiceNumber();

    let subtotal = 0;
    let totalDiscount = 0;
    const detailsData = [];

    for (const item of items) {
      const product = await Product.findByPk(item.productId, { transaction: t });
      if (!product) {
        await t.rollback();
        return res.status(400).json({ error: `Producto con ID ${item.productId} no encontrado` });
      }

      if (product.stock < item.quantity) {
        await t.rollback();
        return res.status(400).json({ 
          error: `Stock insuficiente para "${product.name}". Disponible: ${product.stock}` 
        });
      }

      let discountPercentage = 0;
      let discountTypeId = item.discountTypeId || null;

      // Si se especifica un tipo de descuento, obtener su porcentaje
      if (discountTypeId) {
        const discount = await DiscountType.findByPk(discountTypeId, { transaction: t });
        if (discount && discount.active) {
          discountPercentage = parseFloat(discount.percentage);
        }
      }

      const lineSubtotal = parseFloat(product.price) * item.quantity;
      const discountAmount = (lineSubtotal * discountPercentage) / 100;
      const lineTotal = lineSubtotal - discountAmount;

      subtotal += lineSubtotal;
      totalDiscount += discountAmount;

      detailsData.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price,
        discountTypeId,
        discountPercentage,
        discountAmount,
        lineTotal
      });

      // Descontar stock
      const previousStock = product.stock;
      const newStock = previousStock - item.quantity;
      await product.update({ stock: newStock }, { transaction: t });

      // Registrar movimiento
      await InventoryMovement.create({
        productId: product.id,
        userId: req.user.id,
        type: 'salida',
        quantity: item.quantity,
        previousStock,
        newStock,
        reason: `Venta - Factura ${invoiceNumber}`
      }, { transaction: t });
    }

    const tax = 0; // Puedes configurar IVA aquí
    const total = subtotal - totalDiscount + tax;

    // Crear factura
    const invoice = await Invoice.create({
      invoiceNumber,
      customerName: customerName || 'Cliente General',
      customerTypeId,
      userId: req.user.id,
      subtotal,
      totalDiscount,
      tax,
      total,
      status: 'completada',
      notes
    }, { transaction: t });

    // Crear detalles
    for (const detail of detailsData) {
      await InvoiceDetail.create({
        invoiceId: invoice.id,
        ...detail
      }, { transaction: t });
    }

    await t.commit();

    // Retornar factura completa
    const fullInvoice = await Invoice.findByPk(invoice.id, {
      include: [
        { model: User, as: 'seller', attributes: ['id', 'name'] },
        { model: CustomerType, attributes: ['id', 'name'] },
        {
          model: InvoiceDetail,
          as: 'details',
          include: [
            { model: Product, attributes: ['id', 'name', 'barcode'] },
            { model: DiscountType, attributes: ['id', 'name'] }
          ]
        }
      ]
    });

    // Registrar venta en caja si hay una abierta
    await registerSale(total, req.user.id, invoice.id);

    res.status(201).json(fullInvoice);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: 'Error al crear factura', details: error.message });
  }
};

const cancel = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const invoice = await Invoice.findByPk(req.params.id, {
      include: [{ model: InvoiceDetail, as: 'details' }]
    });

    if (!invoice) {
      await t.rollback();
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    if (invoice.status === 'anulada') {
      await t.rollback();
      return res.status(400).json({ error: 'La factura ya está anulada' });
    }

    // Devolver stock
    for (const detail of invoice.details) {
      const product = await Product.findByPk(detail.productId, { transaction: t });
      const previousStock = product.stock;
      const newStock = previousStock + detail.quantity;

      await product.update({ stock: newStock }, { transaction: t });

      await InventoryMovement.create({
        productId: product.id,
        userId: req.user.id,
        type: 'entrada',
        quantity: detail.quantity,
        previousStock,
        newStock,
        reason: `Anulación de factura ${invoice.invoiceNumber}`
      }, { transaction: t });
    }

    await invoice.update({ status: 'anulada' }, { transaction: t });

    await t.commit();
    res.json({ message: 'Factura anulada y stock devuelto' });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: 'Error al anular factura', details: error.message });
  }
};

module.exports = { getAll, getById, create, cancel };
