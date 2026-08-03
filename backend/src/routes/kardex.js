const { Router } = require('express');
const { getKardex, getKardexPDF } = require('../controllers/kardexController');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.use(authenticate);
router.get('/:id', getKardex);
router.get('/:id/pdf', getKardexPDF);

module.exports = router;
