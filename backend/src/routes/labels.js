const { Router } = require('express');
const labelController = require('../controllers/labelController');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.use(authenticate);

// Generar PDF con múltiples etiquetas
router.post('/generate', labelController.generateLabels);

// Obtener etiqueta individual (imagen PNG)
router.get('/single/:id', labelController.getSingleLabel);

module.exports = router;
