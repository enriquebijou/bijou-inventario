const PDFDocument = require('pdfkit');
const bwipjs = require('bwip-js');
const { Product } = require('../models');

/**
 * Genera un PDF con etiquetas de código de barras
 * Tamaño de etiqueta: 4cm ancho x 1.5cm alto (113.4pt x 42.5pt)
 * Se organizan en una hoja carta con márgenes
 */
const generateLabels = async (req, res) => {
  try {
    const { productIds, copies = 1 } = req.body;
    // productIds: array de IDs de productos
    // copies: cantidad de etiquetas por producto

    if (!productIds || productIds.length === 0) {
      return res.status(400).json({ error: 'Debe seleccionar al menos un producto' });
    }

    const products = await Product.findAll({
      where: { id: productIds }
    });

    if (products.length === 0) {
      return res.status(404).json({ error: 'No se encontraron productos' });
    }

    // Configuración de la página (carta: 612 x 792 puntos)
    const pageWidth = 612;
    const pageHeight = 792;
    const marginLeft = 28; // ~1cm
    const marginTop = 28;

    // Tamaño de etiqueta en puntos (1cm = 28.35pt)
    const labelWidth = 113.4;  // 4cm
    const labelHeight = 42.5;  // 1.5cm
    const gapX = 5;  // Espacio entre etiquetas horizontal
    const gapY = 5;  // Espacio entre etiquetas vertical

    // Calcular cuántas etiquetas caben por fila y columna
    const labelsPerRow = Math.floor((pageWidth - 2 * marginLeft) / (labelWidth + gapX));
    const labelsPerCol = Math.floor((pageHeight - 2 * marginTop) / (labelHeight + gapY));
    const labelsPerPage = labelsPerRow * labelsPerCol;

    // Crear PDF
    const doc = new PDFDocument({
      size: 'letter',
      margins: { top: marginTop, bottom: marginTop, left: marginLeft, right: marginLeft }
    });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=etiquetas.pdf'
    });

    doc.pipe(res);

    // Generar lista de etiquetas (producto + copias)
    const labels = [];
    for (const product of products) {
      for (let i = 0; i < copies; i++) {
        labels.push(product);
      }
    }

    let labelIndex = 0;

    while (labelIndex < labels.length) {
      if (labelIndex > 0 && labelIndex % labelsPerPage === 0) {
        doc.addPage();
      }

      const posInPage = labelIndex % labelsPerPage;
      const row = Math.floor(posInPage / labelsPerRow);
      const col = posInPage % labelsPerRow;

      const x = marginLeft + col * (labelWidth + gapX);
      const y = marginTop + row * (labelHeight + gapY);

      const product = labels[labelIndex];

      // Dibujar borde de etiqueta (opcional, para corte)
      doc.rect(x, y, labelWidth, labelHeight).stroke('#cccccc');

      // Nombre del producto (truncado)
      const displayName = product.name.length > 20 
        ? product.name.substring(0, 20) + '...' 
        : product.name;
      
      doc.fontSize(5)
         .text(displayName, x + 2, y + 2, { width: labelWidth - 4, align: 'center' });

      // Generar código de barras como PNG buffer
      try {
        const barcodeBuffer = await bwipjs.toBuffer({
          bcid: 'ean13',
          text: product.barcode,
          scale: 2,
          height: 8,
          includetext: true,
          textsize: 7,
          textxalign: 'center'
        });

        // Insertar código de barras
        doc.image(barcodeBuffer, x + 8, y + 11, {
          width: labelWidth - 16,
          height: 28
        });
      } catch (barcodeError) {
        // Si falla el código de barras, poner el texto
        doc.fontSize(6)
           .text(product.barcode, x + 2, y + 18, { width: labelWidth - 4, align: 'center' });
      }

      // Precio de venta (más grande y visible)
      doc.fontSize(7)
         .font('Helvetica-Bold')
         .text(`Q${parseFloat(product.price).toFixed(2)}`, x + 2, y + labelHeight - 10, { 
           width: labelWidth - 4, 
           align: 'right' 
         })
         .font('Helvetica');

      labelIndex++;
    }

    doc.end();
  } catch (error) {
    res.status(500).json({ error: 'Error al generar etiquetas', details: error.message });
  }
};

// Generar etiqueta individual (imagen PNG)
const getSingleLabel = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const png = await bwipjs.toBuffer({
      bcid: 'ean13',
      text: product.barcode,
      scale: 3,
      height: 12,
      includetext: true,
      textxalign: 'center'
    });

    res.set('Content-Type', 'image/png');
    res.send(png);
  } catch (error) {
    res.status(500).json({ error: 'Error al generar etiqueta', details: error.message });
  }
};

module.exports = { generateLabels, getSingleLabel };
