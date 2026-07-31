const { Router } = require('express');
const settingsController = require('../controllers/settingsController');
const alertController = require('../controllers/alertController');
const { authenticate, authorize } = require('../middleware/auth');

const router = Router();

router.use(authenticate);

router.get('/', settingsController.getSettings);
router.put('/', authorize('admin'), settingsController.updateSettings);
router.get('/alerts/low-stock', alertController.getLowStockAlerts);

module.exports = router;
