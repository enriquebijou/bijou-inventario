const { Router } = require('express');
const purchaseController = require('../controllers/purchaseController');
const { authenticate, authorize } = require('../middleware/auth');

const router = Router();

router.use(authenticate);

router.get('/', purchaseController.getAll);
router.get('/:id', purchaseController.getById);
router.post('/', authorize('admin', 'almacenero'), purchaseController.create);
router.post('/:id/cancel', authorize('admin'), purchaseController.cancel);

module.exports = router;
