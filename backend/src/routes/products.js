const { Router } = require('express');
const productController = require('../controllers/productController');
const { authenticate, authorize } = require('../middleware/auth');

const router = Router();

router.use(authenticate);

router.get('/', productController.getAll);
router.get('/barcode/:barcode', productController.getByBarcode);
router.get('/:id', productController.getById);
router.get('/:id/barcode-image', productController.getBarcodeImage);
router.post('/', authorize('admin', 'almacenero'), productController.create);
router.put('/:id', authorize('admin', 'almacenero'), productController.update);
router.delete('/:id', authorize('admin'), productController.remove);
router.post('/:id/adjust-stock', authorize('admin', 'almacenero'), productController.adjustStock);

module.exports = router;
