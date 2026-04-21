const express  = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const {
  paymentLimiter, requireKYC,
  preventDuplicatePayment, auditLog,
} = require('../middleware/security');
const {
  initializePayment, verifyPayment, handleWebhook,
  getMyPayments, getPaymentByReference,
  getAllPayments, getPaymentStats,
} = require('../controllers/paymentController');

const router = express.Router();

// ── Webhook — public, no auth ─────────────────────────────────
router.post('/webhook', handleWebhook);

// ── Admin routes ──────────────────────────────────────────────
router.get('/admin/all',   protect, authorize('admin'), getAllPayments);
router.get('/admin/stats', protect, authorize('admin'), getPaymentStats);

// ── Customer routes ───────────────────────────────────────────
router.post('/initialize',
  protect,
  paymentLimiter,
  requireKYC,
  preventDuplicatePayment,
  auditLog('PAYMENT_INITIALIZE'),
  [
    body('policyId').notEmpty().isMongoId().withMessage('Valid policy ID required'),
    body('amount').isNumeric({ min: 1 }).withMessage('Amount must be positive'),
  ],
  initializePayment
);

router.get('/',                  protect, getMyPayments);
router.get('/verify/:reference', protect, auditLog('PAYMENT_VERIFY'), verifyPayment);
router.get('/:reference',        protect, getPaymentByReference);

module.exports = router;
