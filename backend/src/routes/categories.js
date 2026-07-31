const { Router } = require('express');
const categoryController = require('../controllers/categoryController');
const { authenticate, authorize } = require('../middleware/auth');

const router = Router();

router.use(authenticate);

router.get('/', categoryController.getAll);
router.post('/', authorize('admin'), categoryController.create);
router.put('/:id', authorize('admin'), categoryController.update);
router.delete('/:id', authorize('admin'), categoryController.remove);

module.exports = router;
