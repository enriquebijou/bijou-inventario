const { Router } = require('express');
const authRoutes = require('./auth');
const productRoutes = require('./products');
const categoryRoutes = require('./categories');
const discountRoutes = require('./discounts');
const invoiceRoutes = require('./invoices');
const labelRoutes = require('./labels');
const purchaseRoutes = require('./purchases');
const settingsRoutes = require('./settings');
const reportRoutes = require('./reports');
const kardexRoutes = require('./kardex');
const cashRoutes = require('./cash');

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/discounts', discountRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/labels', labelRoutes);
router.use('/purchases', purchaseRoutes);
router.use('/settings', settingsRoutes);
router.use('/reports', reportRoutes);
router.use('/kardex', kardexRoutes);
router.use('/cash', cashRoutes);

module.exports = router;
