const { Router } = require('express');
const { getKardex } = require('../controllers/kardexController');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.use(authenticate);
router.get('/:id', getKardex);

module.exports = router;
