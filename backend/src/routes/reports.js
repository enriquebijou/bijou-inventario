const { Router } = require('express');
const reportController = require('../controllers/reportController');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.use(authenticate);

router.post('/inventory-pdf', reportController.generateInventoryPDF);

module.exports = router;
