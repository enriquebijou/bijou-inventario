const PDFDocument = require('pdfkit');
const { Product, Category, StoreSettings } = require('../models');

const generateInventoryPDF = async (req, res) => {
  try {
    const { productIds } = req.body;

    let where = { active: true };
    if (productIds && productIds.length > 0) {
      where.id = productIds;
    }

    const products = await Product.findAll({
      where,
      include: [{ model: Category, attributes: ['id', 'name'] }],
      order: [['name', 'ASC']]
    });

    const settings = await StoreSettings.findOne();
    const storeName = settings?.storeName || 'Mi Tienda';

    // Crear PDF
    const doc = new PDFDocument({ size: 'letter', margin: 40 });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=reporte_inventario.pdf'
    });

    doc.pipe(res);

    // Encabezado
    doc.fontSize(18).font('Helvetica-Bold')
       .text(storeName, { align: 'center' });
    doc.fontSize(12).font('Helvetica')
       .text('Reporte de Inventario', { align: 'center' });
    doc.fontSize(9)
       .text(`Fecha: ${new Date().toLocaleDateString('es-GT')} | Productos: ${products.length}`, { align: 'center' });
    
    doc.moveDown(1.5);

    // Calcular totales
    let totalCost = 0;
    let totalUnits = 0;

    // Columnas: Producto, Código, Categoría, Stock, Costo U., Valor Costo
    const colX = [40, 200, 300, 380, 430, 500];
    const colWidths = [155, 95, 75, 45, 65, 70];

    // Header
    const tableTop = doc.y;
    doc.rect(40, tableTop - 4, 532, 16).fill('#1a237e');
    doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold');
    doc.text('Producto', colX[0], tableTop, { width: colWidths[0] });
    doc.text('Código', colX[1], tableTop, { width: colWidths[1] });
    doc.text('Categoría', colX[2], tableTop, { width: colWidths[2] });
    doc.text('Stock', colX[3], tableTop, { width: colWidths[3], align: 'center' });
    doc.text('Costo U.', colX[4], tableTop, { width: colWidths[4], align: 'right' });
    doc.text('Valor Costo', colX[5], tableTop, { width: colWidths[5], align: 'right' });

    doc.fillColor('#000000');
    let rowY = tableTop + 18;

    products.forEach((product, i) => {
      const cost = parseFloat(product.cost || 0);
      const valueCost = cost * product.stock;

      totalCost += valueCost;
      totalUnits += product.stock;

      // Alternar color de fila
      if (i % 2 === 0) {
        doc.rect(40, rowY - 3, 532, 14).fill('#f5f5f5');
        doc.fillColor('#000000');
      }

      // Verificar si necesita nueva página
      if (rowY > 720) {
        doc.addPage();
        rowY = 50;
      }

      doc.fontSize(7).font('Helvetica');
      const name = product.name.length > 30 ? product.name.substring(0, 30) + '...' : product.name;
      doc.text(name, colX[0], rowY, { width: colWidths[0] });
      doc.text(product.barcode, colX[1], rowY, { width: colWidths[1] });
      doc.text((product.Category?.name || '-').substring(0, 12), colX[2], rowY, { width: colWidths[2] });
      doc.text(String(product.stock), colX[3], rowY, { width: colWidths[3], align: 'center' });
      doc.text(`Q${cost.toFixed(2)}`, colX[4], rowY, { width: colWidths[4], align: 'right' });
      doc.text(`Q${valueCost.toFixed(2)}`, colX[5], rowY, { width: colWidths[5], align: 'right' });

      rowY += 14;
    });

    // Fila de totales
    rowY += 5;
    doc.rect(40, rowY - 3, 532, 16).fill('#1a237e');
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8);
    doc.text('TOTALES', colX[0], rowY);
    doc.text(String(totalUnits), colX[3], rowY, { width: colWidths[3], align: 'center' });
    doc.text(`Q${totalCost.toFixed(2)}`, colX[5], rowY, { width: colWidths[5], align: 'right' });

    doc.end();
  } catch (error) {
    res.status(500).json({ error: 'Error al generar PDF', details: error.message });
  }
};

module.exports = { generateInventoryPDF };
