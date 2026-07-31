const { Router } = require('express');
const invoiceController = require('../controllers/invoiceController');
const { authenticate, authorize } = require('../middleware/auth');

const router = Router();

router.use(authenticate);

router.get('/', invoiceController.getAll);
router.get('/:id', invoiceController.getById);
router.post('/', authorize('admin', 'vendedor'), invoiceController.create);
router.post('/:id/cancel', authorize('admin'), invoiceController.cancel);

module.exports = router;
