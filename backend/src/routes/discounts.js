const { Router } = require('express');
const discountController = require('../controllers/discountController');
const { authenticate, authorize } = require('../middleware/auth');

const router = Router();

router.use(authenticate);

// Tipos de cliente
router.get('/customer-types', discountController.getAllCustomerTypes);
router.post('/customer-types', authorize('admin'), discountController.createCustomerType);
router.put('/customer-types/:id', authorize('admin'), discountController.updateCustomerType);
router.delete('/customer-types/:id', authorize('admin'), discountController.removeCustomerType);

// Tipos de descuento
router.get('/discount-types', discountController.getAllDiscountTypes);
router.post('/discount-types', authorize('admin'), discountController.createDiscountType);
router.put('/discount-types/:id', authorize('admin'), discountController.updateDiscountType);
router.delete('/discount-types/:id', authorize('admin'), discountController.removeDiscountType);

module.exports = router;
