const { Category } = require('../models');

const getAll = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { active: true },
      order: [['name', 'ASC']]
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
};

const create = async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await Category.create({ name, description });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear categoría', details: error.message });
  }
};

const update = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    const { name, description } = req.body;
    await category.update({ name, description });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar categoría', details: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    await category.update({ active: false });
    res.json({ message: 'Categoría eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar categoría' });
  }
};

module.exports = { getAll, create, update, remove };
