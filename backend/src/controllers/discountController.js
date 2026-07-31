const { CustomerType, DiscountType } = require('../models');

// --- TIPOS DE CLIENTE ---

const getAllCustomerTypes = async (req, res) => {
  try {
    const types = await CustomerType.findAll({
      where: { active: true },
      include: [{
        model: DiscountType,
        where: { active: true },
        required: false
      }],
      order: [['name', 'ASC']]
    });
    res.json(types);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener tipos de cliente' });
  }
};

const createCustomerType = async (req, res) => {
  try {
    const { name, description } = req.body;
    const type = await CustomerType.create({ name, description });
    res.status(201).json(type);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear tipo de cliente', details: error.message });
  }
};

const updateCustomerType = async (req, res) => {
  try {
    const type = await CustomerType.findByPk(req.params.id);
    if (!type) {
      return res.status(404).json({ error: 'Tipo de cliente no encontrado' });
    }
    const { name, description } = req.body;
    await type.update({ name, description });
    res.json(type);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar tipo de cliente', details: error.message });
  }
};

const removeCustomerType = async (req, res) => {
  try {
    const type = await CustomerType.findByPk(req.params.id);
    if (!type) {
      return res.status(404).json({ error: 'Tipo de cliente no encontrado' });
    }
    await type.update({ active: false });
    res.json({ message: 'Tipo de cliente eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar tipo de cliente' });
  }
};

// --- TIPOS DE DESCUENTO ---

const getAllDiscountTypes = async (req, res) => {
  try {
    const { customerTypeId } = req.query;
    const where = { active: true };
    if (customerTypeId) where.customerTypeId = customerTypeId;

    const discounts = await DiscountType.findAll({
      where,
      include: [{ model: CustomerType, attributes: ['id', 'name'] }],
      order: [['name', 'ASC']]
    });
    res.json(discounts);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener tipos de descuento' });
  }
};

const createDiscountType = async (req, res) => {
  try {
    const { name, percentage, customerTypeId } = req.body;

    // Usar customerTypeId proporcionado o buscar/crear uno genérico
    let typeId = customerTypeId;
    if (!typeId) {
      const [generic] = await CustomerType.findOrCreate({
        where: { name: 'General' },
        defaults: { name: 'General', description: 'Tipo genérico' }
      });
      typeId = generic.id;
    }

    const discount = await DiscountType.create({ name, percentage, customerTypeId: typeId });
    res.status(201).json(discount);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear tipo de descuento', details: error.message });
  }
};

const updateDiscountType = async (req, res) => {
  try {
    const discount = await DiscountType.findByPk(req.params.id);
    if (!discount) {
      return res.status(404).json({ error: 'Tipo de descuento no encontrado' });
    }
    const { name, percentage, customerTypeId } = req.body;
    await discount.update({ name, percentage, customerTypeId });
    res.json(discount);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar tipo de descuento', details: error.message });
  }
};

const removeDiscountType = async (req, res) => {
  try {
    const discount = await DiscountType.findByPk(req.params.id);
    if (!discount) {
      return res.status(404).json({ error: 'Tipo de descuento no encontrado' });
    }
    await discount.update({ active: false });
    res.json({ message: 'Tipo de descuento eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar tipo de descuento' });
  }
};

module.exports = {
  getAllCustomerTypes,
  createCustomerType,
  updateCustomerType,
  removeCustomerType,
  getAllDiscountTypes,
  createDiscountType,
  updateDiscountType,
  removeDiscountType
};
