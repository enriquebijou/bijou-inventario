const { Router } = require('express');
const { login, register, getProfile, changePassword, getAllUsers, toggleUserActive, resetUserPassword } = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/auth');

const router = Router();

router.post('/login', login);
router.post('/register', authenticate, authorize('admin'), register);
router.get('/profile', authenticate, getProfile);
router.put('/change-password', authenticate, changePassword);

// Gestión de usuarios (solo admin)
router.get('/users', authenticate, authorize('admin'), getAllUsers);
router.put('/users/:id/toggle', authenticate, authorize('admin'), toggleUserActive);
router.put('/users/:id/reset-password', authenticate, authorize('admin'), resetUserPassword);

module.exports = router;
