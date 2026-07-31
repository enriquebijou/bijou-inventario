const { Product, Category, InventoryMovement } = require('../models');
const bwipjs = require('bwip-js');

// Generar código de barras único
function generateBarcode() {
  const prefix = '200'; // Prefijo para códigos internos
  const random = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
  const code = prefix + random;
  // Calcular dígito verificador EAN-13
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(code[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return code + checkDigit;
}

const getAll = async (req, res) => {
  try {
    const { search, categoryId, lowStock } = req.query;
    const where = { active: true };

    if (categoryId) where.categoryId = categoryId;

    const products = await Product.findAll({
      where,
      include: [{ model: Category, attributes: ['id', 'name'] }],
      order: [['name', 'ASC']]
    });

    let result = products;

    if (search) {
      const term = search.toLowerCase();
      result = products.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.barcode.includes(term) ||
        (p.sku && p.sku.toLowerCase().includes(term))
      );
    }

    if (lowStock === 'true') {
      result = result.filter(p => p.stock <= p.minStock);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos', details: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category, attributes: ['id', 'name'] }]
    });

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener producto' });
  }
};

const getByBarcode = async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { barcode: req.params.barcode, active: true },
      include: [{ model: Category, attributes: ['id', 'name'] }]
    });

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar por código de barras' });
  }
};

const create = async (req, res) => {
  try {
    const { name, description, price, minStock, categoryId, unit } = req.body;

    // Generar código de barras automáticamente
    let barcode = generateBarcode();
    
    // Verificar unicidad
    let exists = await Product.findOne({ where: { barcode } });
    while (exists) {
      barcode = generateBarcode();
      exists = await Product.findOne({ where: { barcode } });
    }

    const product = await Product.create({
      name,
      description,
      barcode,
      price,
      cost: 0,
      stock: 0,
      minStock: minStock || 5,
      categoryId,
      unit: unit || 'unidad'
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear producto', details: error.message });
  }
};

const update = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const { name, description, price, minStock, categoryId, unit } = req.body;
    
    await product.update({ name, description, price, minStock, categoryId, unit });

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar producto', details: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    await product.update({ active: false });
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
};

// Generar imagen del código de barras
const getBarcodeImage = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const png = await bwipjs.toBuffer({
      bcid: 'ean13',
      text: product.barcode,
      scale: 3,
      height: 10,
      includetext: true,
      textxalign: 'center'
    });

    res.set('Content-Type', 'image/png');
    res.send(png);
  } catch (error) {
    res.status(500).json({ error: 'Error al generar código de barras', details: error.message });
  }
};

const adjustStock = async (req, res) => {
  try {
    const { quantity, type, reason } = req.body;
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const previousStock = product.stock;
    let newStock;

    if (type === 'entrada') {
      newStock = previousStock + quantity;
    } else if (type === 'salida') {
      if (previousStock < quantity) {
        return res.status(400).json({ error: 'Stock insuficiente' });
      }
      newStock = previousStock - quantity;
    } else {
      newStock = quantity; // ajuste directo
    }

    await product.update({ stock: newStock });

    await InventoryMovement.create({
      productId: product.id,
      userId: req.user.id,
      type,
      quantity,
      previousStock,
      newStock,
      reason
    });

    res.json({ product, previousStock, newStock });
  } catch (error) {
    res.status(500).json({ error: 'Error al ajustar stock', details: error.message });
  }
};

module.exports = { getAll, getById, getByBarcode, create, update, remove, getBarcodeImage, adjustStock };
