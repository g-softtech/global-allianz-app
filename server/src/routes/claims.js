const express  = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const {
  getMyClaims, getClaimById, submitClaim,
  updateClaim, withdrawClaim,
  getAllClaims, getClaimStats,
} = require('../controllers/claimController');

const router = express.Router();

// ── Validation ────────────────────────────────────────────────
const submitValidation = [
  body('policyId')
    .notEmpty().withMessage('Policy ID is required')
    .isMongoId().withMessage('Invalid policy ID'),
  body('incidentDate')
    .notEmpty().withMessage('Incident date is required')
    .isISO8601().withMessage('Invalid date format'),
  body('description')
    .isLength({ min: 20 }).withMessage('Description must be at least 20 characters'),
  body('claimedAmount')
    .isNumeric({ min: 1 }).withMessage('Claimed amount must be a positive number'),
];

// ── Admin routes (before /:id) ────────────────────────────────
router.get('/admin/all',   protect, authorize('admin'), getAllClaims);
router.get('/admin/stats', protect, authorize('admin'), getClaimStats);

// ── Customer / shared routes ──────────────────────────────────
router.get('/',    protect, getMyClaims);
router.post('/',   protect, submitValidation, submitClaim);

router.get('/:id',    protect, getClaimById);
router.put('/:id',    protect, updateClaim);
router.delete('/:id', protect, withdrawClaim);

module.exports = router;
