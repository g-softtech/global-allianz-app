const express    = require('express');
const { body }   = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const {
  getMyPolicies,
  getPolicyById,
  createPolicy,
  updatePolicy,
  cancelPolicy,
  getAllPolicies,
  getPolicyStats,
  renewPolicy,
} = require('../controllers/policyController');

const router = express.Router();

// ── Validation ───────────────────────────────────────────────
const createValidation = [
  body('type')
    .isIn(['motor', 'health', 'life', 'travel', 'property', 'business', 'corporate'])
    .withMessage('Invalid policy type'),
  body('premium.amount')
    .isNumeric({ min: 0 })
    .withMessage('Premium amount must be a positive number'),
];

// ── Admin-only routes (must come before /:id) ─────────────────
router.get('/admin/all',   protect, authorize('admin'), getAllPolicies);
router.get('/admin/stats', protect, authorize('admin'), getPolicyStats);

// ── Customer / shared routes ──────────────────────────────────
router.get('/',    protect, getMyPolicies);       // GET  /api/policies
router.post('/',   protect, createValidation, createPolicy); // POST /api/policies

router.get('/:id',         protect, getPolicyById);   // GET    /api/policies/:id
router.put('/:id',         protect, updatePolicy);    // PUT    /api/policies/:id
router.delete('/:id',      protect, cancelPolicy);    // DELETE /api/policies/:id
router.post('/:id/renew',  protect, renewPolicy);     // POST   /api/policies/:id/renew

module.exports = router;
