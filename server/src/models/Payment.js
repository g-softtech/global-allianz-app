const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({

  reference: {
    type:   String,
    unique: true,
    required: true,
  },

  // ── Relations ─────────────────────────────────────────────
  user: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true,
  },
  policy: {
    type: mongoose.Schema.Types.ObjectId,
    ref:  'Policy',
    default: null,
  },
  claim: {
    type: mongoose.Schema.Types.ObjectId,
    ref:  'Claim',
    default: null,
  },

  // ── Payment details ───────────────────────────────────────
  type: {
    type: String,
    enum: ['policy_premium', 'claim_settlement', 'refund'],
    default: 'policy_premium',
  },
  provider: {
    type: String,
    enum: ['paystack', 'flutterwave', 'bank_transfer', 'manual'],
    default: 'paystack',
  },
  amount: {
    type:     Number,
    required: true,
    min:      1,
  },
  currency: { type: String, default: 'NGN' },

  // ── Status ────────────────────────────────────────────────
  status: {
    type:    String,
    enum:    ['pending', 'success', 'failed', 'abandoned', 'refunded'],
    default: 'pending',
  },

  // ── Provider response data ─────────────────────────────────
  providerResponse: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  channel:      String,   // card, bank, ussd, qr etc.
  paidAt:       Date,
  failureReason:String,

  // ── Meta ──────────────────────────────────────────────────
  description:  String,
  metadata:     { type: mongoose.Schema.Types.Mixed, default: {} },

}, { timestamps: true });

// ── Indexes ───────────────────────────────────────────────────
paymentSchema.index({ user:      1, status: 1 });
paymentSchema.index({ policy:    1 });
paymentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
