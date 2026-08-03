const { Router } = require('express');
const cashController = require('../controllers/cashController');
const { authenticate, authorize } = require('../middleware/auth');

const router = Router();

router.use(authenticate);

router.get('/current', cashController.getCurrent);
router.post('/open', cashController.openRegister);
router.post('/movement', cashController.addMovement);
router.post('/close', cashController.closeRegister);
router.get('/history', authorize('admin'), cashController.getHistory);

module.exports = router;
