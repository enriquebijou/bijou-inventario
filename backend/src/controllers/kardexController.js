const PDFDocument = require('pdfkit');
const { Product, InventoryMovement, User, Sequelize, StoreSettings } = require('../models');
const { Op } = Sequelize;

const getKardex = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const where = { productId: id };
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.createdAt = { [Op.between]: [start, end] };
    }

    const movements = await InventoryMovement.findAll({
      where,
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

const getKardexPDF = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const where = { productId: id };
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.createdAt = { [Op.between]: [start, end] };
    }

    const movements = await InventoryMovement.findAll({
      where,
      include: [{ model: User, attributes: ['id', 'name'] }],
      order: [['createdAt', 'ASC']]
    });

    const settings = await StoreSettings.findOne();
    const storeName = settings?.storeName || 'Mi Tienda';

    // Crear PDF
    const doc = new PDFDocument({ size: 'letter', margin: 40 });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=kardex_${product.barcode}.pdf`
    });

    doc.pipe(res);

    // Encabezado
    doc.fontSize(16).font('Helvetica-Bold').text(storeName, { align: 'center' });
    doc.fontSize(12).font('Helvetica').text('Kardex de Producto', { align: 'center' });
    doc.moveDown(0.5);

    // Info del producto
    doc.fontSize(9).font('Helvetica-Bold').text(`Producto: ${product.name}`);
    doc.fontSize(9).font('Helvetica').text(`Código: ${product.barcode} | Stock actual: ${product.stock} | Costo: Q${parseFloat(product.cost || 0).toFixed(2)}`);
    if (startDate && endDate) {
      doc.text(`Período: ${startDate} al ${endDate}`);
    }
    doc.text(`Generado: ${new Date().toLocaleString('es-GT')}`);
    doc.moveDown(1);

    // Tabla header
    const colX = [40, 130, 210, 270, 330, 390, 500];
    const tableTop = doc.y;

    doc.rect(40, tableTop - 3, 532, 15).fill('#0a1628');
    doc.fillColor('#ffffff').fontSize(7.5).font('Helvetica-Bold');
    doc.text('Fecha', colX[0], tableTop);
    doc.text('Tipo', colX[1], tableTop);
    doc.text('Cantidad', colX[2], tableTop);
    doc.text('Ant.', colX[3], tableTop);
    doc.text('Nuevo', colX[4], tableTop);
    doc.text('Razón', colX[5], tableTop);
    doc.text('Usuario', colX[6], tableTop);

    doc.fillColor('#000000');
    let rowY = tableTop + 17;

    movements.forEach((mov, i) => {
      if (rowY > 720) {
        doc.addPage();
        rowY = 50;
      }

      if (i % 2 === 0) {
        doc.rect(40, rowY - 3, 532, 13).fill('#f5f5f5');
        doc.fillColor('#000000');
      }

      const date = new Date(mov.createdAt).toLocaleString('es-GT', {
        day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit'
      });
      const typeText = mov.type === 'entrada' ? 'ENTRADA' : mov.type === 'salida' ? 'SALIDA' : 'AJUSTE';
      const sign = mov.type === 'entrada' ? '+' : '-';

      doc.fontSize(7).font('Helvetica');
      doc.text(date, colX[0], rowY, { width: 85 });
      doc.text(typeText, colX[1], rowY);
      doc.text(`${sign}${mov.quantity}`, colX[2], rowY);
      doc.text(String(mov.previousStock), colX[3], rowY);
      doc.text(String(mov.newStock), colX[4], rowY);
      doc.text((mov.reason || '-').substring(0, 25), colX[5], rowY, { width: 105 });
      doc.text((mov.User?.name || '-').substring(0, 15), colX[6], rowY);

      rowY += 14;
    });

    // Resumen
    rowY += 10;
    const totalEntradas = movements.filter(m => m.type === 'entrada').reduce((sum, m) => sum + m.quantity, 0);
    const totalSalidas = movements.filter(m => m.type === 'salida').reduce((sum, m) => sum + m.quantity, 0);

    doc.fontSize(9).font('Helvetica-Bold');
    doc.text(`Total entradas: +${totalEntradas} | Total salidas: -${totalSalidas} | Movimientos: ${movements.length}`, 40, rowY);

    doc.end();
  } catch (error) {
    res.status(500).json({ error: 'Error al generar PDF', details: error.message });
  }
};

module.exports = { getKardex, getKardexPDF };
