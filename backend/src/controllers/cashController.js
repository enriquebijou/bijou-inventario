const { CashRegister, CashMovement, User, sequelize } = require('../models');

// Obtener caja abierta actual
const getCurrent = async (req, res) => {
  try {
    const register = await CashRegister.findOne({
      where: { status: 'abierta' },
      include: [
        { model: User, as: 'openedByUser', attributes: ['id', 'name'] },
        {
          model: CashMovement,
          as: 'movements',
          include: [{ model: User, attributes: ['id', 'name'] }],
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    res.json({ register });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener caja', details: error.message });
  }
};

// Abrir caja
const openRegister = async (req, res) => {
  try {
    // Verificar que no haya una caja abierta
    const existing = await CashRegister.findOne({ where: { status: 'abierta' } });
    if (existing) {
      return res.status(400).json({ error: 'Ya hay una caja abierta. Ciérrala primero.' });
    }

    const { openingAmount } = req.body;

    const register = await CashRegister.create({
      openedBy: req.user.id,
      openingAmount: parseFloat(openingAmount) || 0,
      salesTotal: 0,
      withdrawals: 0,
      expectedAmount: parseFloat(openingAmount) || 0,
      status: 'abierta'
    });

    res.status(201).json(register);
  } catch (error) {
    res.status(500).json({ error: 'Error al abrir caja', details: error.message });
  }
};

// Registrar movimiento de efectivo (retiro o ingreso manual)
const addMovement = async (req, res) => {
  try {
    const register = await CashRegister.findOne({ where: { status: 'abierta' } });
    if (!register) {
      return res.status(400).json({ error: 'No hay caja abierta' });
    }

    const { type, amount, description } = req.body;

    if (!['retiro', 'ingreso'].includes(type)) {
      return res.status(400).json({ error: 'Tipo debe ser "retiro" o "ingreso"' });
    }

    const movement = await CashMovement.create({
      cashRegisterId: register.id,
      userId: req.user.id,
      type,
      amount: parseFloat(amount),
      description
    });

    // Actualizar totales de la caja
    if (type === 'retiro') {
      register.withdrawals = parseFloat(register.withdrawals) + parseFloat(amount);
    } else {
      register.salesTotal = parseFloat(register.salesTotal) + parseFloat(amount);
    }
    register.expectedAmount = parseFloat(register.openingAmount) + parseFloat(register.salesTotal) - parseFloat(register.withdrawals);
    await register.save();

    res.status(201).json({ movement, register });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar movimiento', details: error.message });
  }
};

// Registrar venta en caja (se llama automáticamente al facturar)
const registerSale = async (invoiceTotal, userId, invoiceId) => {
  try {
    const register = await CashRegister.findOne({ where: { status: 'abierta' } });
    if (!register) return; // Si no hay caja abierta, no hacer nada

    await CashMovement.create({
      cashRegisterId: register.id,
      userId,
      type: 'venta',
      amount: invoiceTotal,
      description: `Venta - Factura`,
      referenceId: invoiceId
    });

    register.salesTotal = parseFloat(register.salesTotal) + parseFloat(invoiceTotal);
    register.expectedAmount = parseFloat(register.openingAmount) + parseFloat(register.salesTotal) - parseFloat(register.withdrawals);
    await register.save();
  } catch (error) {
    console.error('Error registrando venta en caja:', error);
  }
};

// Cerrar caja
const closeRegister = async (req, res) => {
  try {
    const register = await CashRegister.findOne({ where: { status: 'abierta' } });
    if (!register) {
      return res.status(400).json({ error: 'No hay caja abierta' });
    }

    const { actualAmount, notes } = req.body;
    const actual = parseFloat(actualAmount) || 0;
    const expected = parseFloat(register.expectedAmount);
    const difference = actual - expected;

    await register.update({
      closedBy: req.user.id,
      actualAmount: actual,
      difference,
      status: 'cerrada',
      closedAt: new Date(),
      notes
    });

    res.json({
      register,
      summary: {
        openingAmount: parseFloat(register.openingAmount),
        salesTotal: parseFloat(register.salesTotal),
        withdrawals: parseFloat(register.withdrawals),
        expectedAmount: expected,
        actualAmount: actual,
        difference
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al cerrar caja', details: error.message });
  }
};

// Historial de cajas cerradas
const getHistory = async (req, res) => {
  try {
    const registers = await CashRegister.findAll({
      include: [
        { model: User, as: 'openedByUser', attributes: ['id', 'name'] },
        { model: User, as: 'closedByUser', attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 30
    });

    res.json(registers);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener historial', details: error.message });
  }
};

module.exports = { getCurrent, openRegister, addMovement, registerSale, closeRegister, getHistory };
