const jwt = require('jsonwebtoken');
const { User } = require('../models');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    if (!user.active) {
      return res.status(401).json({ error: 'Usuario desactivado' });
    }

    const isValid = await user.validatePassword(password);
    if (!isValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      token,
      user: user.toJSON()
    });
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const user = await User.create({ name, email, password, role });

    res.status(201).json({ user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear usuario', details: error.message });
  }
};

const getProfile = async (req, res) => {
  res.json({ user: req.user.toJSON() });
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const isValid = await req.user.validatePassword(currentPassword);
    if (!isValid) {
      return res.status(400).json({ error: 'Contraseña actual incorrecta' });
    }

    req.user.password = newPassword;
    await req.user.save();

    res.json({ message: 'Contraseña actualizada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al cambiar contraseña' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(users.map(u => u.toJSON()));
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

const toggleUserActive = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // No permitir desactivarse a sí mismo
    if (user.id === req.user.id) {
      return res.status(400).json({ error: 'No puedes desactivarte a ti mismo' });
    }

    await user.update({ active: !user.active });
    res.json({ message: `Usuario ${user.active ? 'activado' : 'desactivado'}`, user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ error: 'Error al cambiar estado del usuario' });
  }
};

const resetUserPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Contraseña actualizada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al cambiar contraseña' });
  }
};

module.exports = { login, register, getProfile, changePassword, getAllUsers, toggleUserActive, resetUserPassword };
