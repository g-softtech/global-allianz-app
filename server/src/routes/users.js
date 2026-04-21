const express  = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getMe, updateProfile, changePassword, submitKYC,
  getAllUsers, getUserById, updateUser, reviewKYC, getUserStats,
} = require('../controllers/userController');

const router = express.Router();

// ── Self (logged-in user) ─────────────────────────────────────
router.get('/me',                  protect, getMe);
router.put('/profile',             protect, updateProfile);
router.put('/change-password',     protect, changePassword);
router.post('/kyc',                protect, submitKYC);

// ── Admin-only stats (must come before /:id) ──────────────────
router.get('/admin/stats',         protect, authorize('admin'), getUserStats);

// ── Admin CRUD ────────────────────────────────────────────────
router.get('/',                    protect, authorize('admin'), getAllUsers);
router.get('/:id',                 protect, authorize('admin'), getUserById);
router.put('/:id',                 protect, authorize('admin'), updateUser);
router.put('/:id/kyc',             protect, authorize('admin'), reviewKYC);

module.exports = router;
