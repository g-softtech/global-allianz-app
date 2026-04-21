const { v4: uuidv4 } = require('uuid');
const Payment  = require('../models/Payment');
const Policy   = require('../models/Policy');
const Claim    = require('../models/Claim');
const {
  initializeTransaction,
  verifyTransaction,
  verifyWebhookSignature,
} = require('../services/paystackService');
const { sendPaymentConfirmation } = require('../services/emailService');

// ── Generate a unique payment reference ───────────────────────
const generateReference = () =>
  `GAIB-PAY-${Date.now()}-${uuidv4().slice(0, 8).toUpperCase()}`;

const paginate = (page = 1, limit = 10) => {
  const p = Math.max(1, parseInt(page));
  const l = Math.min(50, Math.max(1, parseInt(limit)));
  return { skip: (p - 1) * l, limit: l, page: p };
};

// ────────────────────────────────────────────────────────────
// @desc    Initialize payment for a policy premium
// @route   POST /api/payments/initialize
// @access  Private
// ────────────────────────────────────────────────────────────
const initializePayment = async (req, res) => {
  try {
    const { policyId, amount } = req.body;

    if (!policyId || !amount) {
      return res.status(400).json({ success: false, message: 'policyId and amount are required' });
    }

    // Validate policy exists and belongs to user
    const policy = await Policy.findById(policyId);
    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }
    if (policy.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (policy.status === 'active') {
      return res.status(400).json({ success: false, message: 'This policy is already active' });
    }

    const reference = generateReference();

    // Create pending payment record
    const payment = await Payment.create({
      reference,
      user:        req.user._id,
      policy:      policyId,
      type:        'policy_premium',
      provider:    'paystack',
      amount,
      description: `Premium payment for ${policy.policyNumber || 'policy'}`,
      metadata:    { policyId, policyType: policy.type },
    });

    // Initialize with Paystack
    const paystackData = await initializeTransaction({
      email:       req.user.email,
      amount,
      reference,
      metadata:    { userId: req.user._id.toString(), policyId, paymentId: payment._id.toString() },
      callbackUrl: `${process.env.CLIENT_URL}/payment/verify?reference=${reference}`,
    });

    res.json({
      success:           true,
      message:           'Payment initialized',
      data: {
        reference,
        paymentId:         payment._id,
        authorizationUrl:  paystackData.authorization_url,
        accessCode:        paystackData.access_code,
        amount,
      },
    });
  } catch (error) {
    console.error('initializePayment error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to initialize payment' });
  }
};

// ────────────────────────────────────────────────────────────
// @desc    Verify payment after redirect from Paystack
// @route   GET /api/payments/verify/:reference
// @access  Private
// ────────────────────────────────────────────────────────────
const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    // Find our payment record
    const payment = await Payment.findOne({ reference });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    // Already verified
    if (payment.status === 'success') {
      return res.json({ success: true, message: 'Payment already verified', data: payment });
    }

    // Verify with Paystack
    const paystackData = await verifyTransaction(reference);

    if (paystackData.status === 'success') {
      // Update payment record
      payment.status           = 'success';
      payment.paidAt           = new Date(paystackData.paid_at);
      payment.channel          = paystackData.channel;
      payment.providerResponse = paystackData;
      await payment.save();

      // Activate the policy
      if (payment.policy) {
        const policy = await Policy.findById(payment.policy);
        if (policy) {
          policy.status          = 'active';
          policy.lastPaymentDate = payment.paidAt;
          policy.totalPaid       = (policy.totalPaid || 0) + payment.amount;

          // Set policy dates if not already set
          if (!policy.startDate) {
            policy.startDate = new Date();
            const endDate    = new Date();
            endDate.setFullYear(endDate.getFullYear() + 1);
            policy.endDate   = endDate;
          }

          // Set next payment date (1 year from now for annual)
          const nextPayment = new Date();
          nextPayment.setFullYear(nextPayment.getFullYear() + 1);
          policy.nextPaymentDate = nextPayment;

          await policy.save();
        }
      }

      // Send confirmation email (non-blocking)
      sendPaymentConfirmation(
        req.user.email,
        req.user.firstName,
        payment
      ).catch(console.error);

      return res.json({
        success: true,
        message: 'Payment verified successfully. Your policy is now active.',
        data:    payment,
      });

    } else {
      // Payment failed or abandoned
      payment.status        = paystackData.status === 'abandoned' ? 'abandoned' : 'failed';
      payment.failureReason = paystackData.gateway_response || 'Payment not completed';
      payment.providerResponse = paystackData;
      await payment.save();

      return res.status(400).json({
        success: false,
        message: `Payment ${payment.status}: ${payment.failureReason}`,
        data:    payment,
      });
    }
  } catch (error) {
    console.error('verifyPayment error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to verify payment' });
  }
};

// ────────────────────────────────────────────────────────────
// @desc    Paystack webhook handler
// @route   POST /api/payments/webhook
// @access  Public (Paystack server — verified by signature)
// ────────────────────────────────────────────────────────────
const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-paystack-signature'];

    // Verify the webhook came from Paystack
    if (!verifyWebhookSignature(req.rawBody, signature)) {
      return res.status(401).json({ message: 'Invalid webhook signature' });
    }

    const event = req.body;
    console.log(`📩 Paystack webhook: ${event.event}`);

    if (event.event === 'charge.success') {
      const { reference } = event.data;
      const payment = await Payment.findOne({ reference });

      if (payment && payment.status !== 'success') {
        payment.status           = 'success';
        payment.paidAt           = new Date(event.data.paid_at);
        payment.channel          = event.data.channel;
        payment.providerResponse = event.data;
        await payment.save();

        // Activate associated policy
        if (payment.policy) {
          await Policy.findByIdAndUpdate(payment.policy, {
            status:          'active',
            lastPaymentDate: payment.paidAt,
            $inc:            { totalPaid: payment.amount },
          });
        }

        console.log(`✅ Webhook: Payment ${reference} confirmed, policy activated`);
      }
    }

    // Always respond 200 to acknowledge receipt
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
};

// ────────────────────────────────────────────────────────────
// @desc    Get my payments
// @route   GET /api/payments
// @access  Private
// ────────────────────────────────────────────────────────────
const getMyPayments = async (req, res) => {
  try {
    const { status, page, limit } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const { skip, limit: lim, page: p } = paginate(page, limit);

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate('policy', 'policyNumber type')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(lim)
        .lean(),
      Payment.countDocuments(filter),
    ]);

    res.json({ success: true, count: payments.length, total, pages: Math.ceil(total / lim), page: p, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch payments' });
  }
};

// ────────────────────────────────────────────────────────────
// @desc    Get single payment by reference
// @route   GET /api/payments/:reference
// @access  Private
// ────────────────────────────────────────────────────────────
const getPaymentByReference = async (req, res) => {
  try {
    const payment = await Payment.findOne({ reference: req.params.reference })
      .populate('policy', 'policyNumber type status')
      .populate('user',   'firstName lastName email');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    const isOwner = payment.user._id.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch payment' });
  }
};

// ────────────────────────────────────────────────────────────
// ADMIN
// ────────────────────────────────────────────────────────────

const getAllPayments = async (req, res) => {
  try {
    const { status, provider, page, limit } = req.query;
    const filter = {};
    if (status)   filter.status   = status;
    if (provider) filter.provider = provider;

    const { skip, limit: lim, page: p } = paginate(page, limit);

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate('user',   'firstName lastName email')
        .populate('policy', 'policyNumber type')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(lim)
        .lean(),
      Payment.countDocuments(filter),
    ]);

    res.json({ success: true, count: payments.length, total, pages: Math.ceil(total / lim), page: p, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch payments' });
  }
};

const getPaymentStats = async (req, res) => {
  try {
    const [byStatus, totals, byProvider] = await Promise.all([
      Payment.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$amount' } } },
      ]),
      Payment.aggregate([
        { $group: {
          _id:          null,
          totalRevenue: { $sum: { $cond: [{ $eq: ['$status', 'success'] }, '$amount', 0] } },
          totalCount:   { $sum: 1 },
          successCount: { $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] } },
        }},
      ]),
      Payment.aggregate([
        { $group: { _id: '$provider', count: { $sum: 1 }, total: { $sum: '$amount' } } },
      ]),
    ]);

    res.json({ success: true, data: { byStatus, byProvider, totals: totals[0] || {} } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch payment stats' });
  }
};

module.exports = {
  initializePayment,
  verifyPayment,
  handleWebhook,
  getMyPayments,
  getPaymentByReference,
  getAllPayments,
  getPaymentStats,
};
