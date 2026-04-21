const express  = require('express');
const { body } = require('express-validator');
const { protect, authorize }  = require('../middleware/auth');
const {
  requireKYC, requireCompleteProfile, auditLog,
} = require('../middleware/security');
const {
  getMyPolicies, getPolicyById, createPolicy,
  updatePolicy, cancelPolicy, getAllPolicies,
  getPolicyStats, renewPolicy,
} = require('../controllers/policyController');

const router = express.Router();

const createValidation = [
  body('type')
    .isIn(['motor', 'health', 'life', 'travel', 'property', 'business', 'corporate'])
    .withMessage('Invalid policy type'),
  body('premium.amount')
    .isNumeric({ min: 0 })
    .withMessage('Premium amount must be a positive number'),
];

// ── Admin routes ──────────────────────────────────────────────
router.get('/admin/all',   protect, authorize('admin'), getAllPolicies);
router.get('/admin/stats', protect, authorize('admin'), getPolicyStats);

// ── Customer routes ───────────────────────────────────────────
router.get('/', protect, getMyPolicies);

// KYC + Profile required before creating a policy
router.post('/',
  protect,
  requireKYC,
  requireCompleteProfile,
  auditLog('POLICY_CREATE_ATTEMPT'),
  createValidation,
  createPolicy
);

router.get('/:id',        protect, getPolicyById);
router.put('/:id',        protect, updatePolicy);
router.delete('/:id',     protect, auditLog('POLICY_CANCEL'), cancelPolicy);
router.post('/:id/renew', protect, requireKYC, auditLog('POLICY_RENEW'), renewPolicy);

module.exports = router;
