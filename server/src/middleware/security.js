const rateLimit = require('express-rate-limit');
const mongoose  = require('mongoose');

// ─────────────────────────────────────────────────────────────
// 1. KYC GATE
// ─────────────────────────────────────────────────────────────
const requireKYC = (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
  if (!req.user.kycVerified) {
    return res.status(403).json({
      success:  false,
      code:     'KYC_REQUIRED',
      message:  'Identity verification required before purchasing a policy.',
      action:   'Please complete your KYC on the Profile page.',
      redirect: '/profile',
    });
  }
  next();
};

// ─────────────────────────────────────────────────────────────
// 2. PROFILE COMPLETENESS GATE
// ─────────────────────────────────────────────────────────────
const requireCompleteProfile = (req, res, next) => {
  const u = req.user;
  const missing = [];
  if (!u.phone)           missing.push('phone number');
  if (!u.dateOfBirth)     missing.push('date of birth');
  if (!u.address?.state)  missing.push('state of residence');
  if (missing.length > 0) {
    return res.status(403).json({
      success:  false,
      code:     'PROFILE_INCOMPLETE',
      message:  `Please complete your profile before purchasing. Missing: ${missing.join(', ')}.`,
      redirect: '/profile',
    });
  }
  next();
};

// ─────────────────────────────────────────────────────────────
// 3. HIGH-VALUE TRANSACTION GUARD
// ─────────────────────────────────────────────────────────────
const HIGH_VALUE_THRESHOLD = 100000;
const requireReAuthForHighValue = async (req, res, next) => {
  const amount = req.body.amount || 0;
  if (amount < HIGH_VALUE_THRESHOLD) return next();
  const reAuthToken = req.headers['x-reauth-confirmed'];
  if (!reAuthToken || reAuthToken !== 'true') {
    return res.status(402).json({
      success:   false,
      code:      'REAUTH_REQUIRED',
      message:   `Transactions above ₦${HIGH_VALUE_THRESHOLD.toLocaleString()} require password confirmation.`,
      threshold: HIGH_VALUE_THRESHOLD,
    });
  }
  next();
};

// ─────────────────────────────────────────────────────────────
// 4. PAYMENT IDEMPOTENCY
// ─────────────────────────────────────────────────────────────
const preventDuplicatePayment = async (req, res, next) => {
  try {
    const Payment  = mongoose.model('Payment');
    const { policyId } = req.body;
    if (!policyId) return next();
    const recent = await Payment.findOne({
      policy:    policyId,
      user:      req.user._id,
      status:    'pending',
      createdAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) },
    });
    if (recent) {
      return res.status(409).json({
        success:   false,
        code:      'DUPLICATE_PAYMENT',
        message:   'A payment is already in progress for this policy.',
        reference: recent.reference,
        data:      { reference: recent.reference, paymentId: recent._id },
      });
    }
    next();
  } catch (error) {
    console.error('idempotency check error:', error);
    next();
  }
};

// ─────────────────────────────────────────────────────────────
// 5. RATE LIMITERS
// ─────────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 10 : 100,
  skipSuccessfulRequests: true,
  message: { success: false, code: 'TOO_MANY_ATTEMPTS', message: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders:   false,
});

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 20 : 200,
  message: { success: false, code: 'TOO_MANY_REQUESTS', message: 'Too many payment requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders:   false,
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 5 : 50,
  message: { success: false, code: 'TOO_MANY_OTP_REQUESTS', message: 'Too many OTP requests. Please wait 15 minutes.' },
  standardHeaders: true,
  legacyHeaders:   false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 300 : 2000,
  skip: (req) => {
    const path = req.originalUrl || '';
    return (
      path.includes('/admin/') ||
      path.endsWith('/users/me') ||
      path.endsWith('/api/health')
    );
  },
  message: { success: false, code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders:   false,
});

// ─────────────────────────────────────────────────────────────
// 6. AUDIT LOGGER
// ─────────────────────────────────────────────────────────────
const auditLog = (action) => (req, res, next) => {
  const ip      = req.ip || req.connection?.remoteAddress || 'unknown';
  const ua      = req.headers['user-agent'] || 'unknown';
  const userId  = req.user?._id || 'unauthenticated';
  console.log(`[AUDIT] ${new Date().toISOString()} | ${action} | user:${userId} | ip:${ip} | ua:${ua.slice(0, 60)}`);
  next();
};

// ─────────────────────────────────────────────────────────────
// 7. SANITIZE RESPONSE
// Strips sensitive fields — safely handles Mongoose documents
// ─────────────────────────────────────────────────────────────
const SENSITIVE_FIELDS = new Set(['password', 'otp', 'refreshTokens', '__v', 'passwordResetToken', 'passwordResetExpires']);

const sanitizeResponse = (req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = (body) => {
    try {
      if (body && typeof body === 'object') {
        // Convert to plain JSON first — this breaks circular refs and Mongoose internals
        const plain = JSON.parse(JSON.stringify(body));
        body = stripSensitive(plain);
      }
    } catch (e) {
      // If serialization fails, just send as-is rather than crashing
      console.warn('[sanitizeResponse] Could not sanitize response:', e.message);
    }
    return originalJson(body);
  };

  next();
};

function stripSensitive(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => stripSensitive(item));
  }

  const clean = {};
  for (const key of Object.keys(obj)) {
    if (!SENSITIVE_FIELDS.has(key)) {
      clean[key] = stripSensitive(obj[key]);
    }
  }
  return clean;
}

module.exports = {
  requireKYC,
  requireCompleteProfile,
  requireReAuthForHighValue,
  preventDuplicatePayment,
  authLimiter,
  paymentLimiter,
  otpLimiter,
  generalLimiter,
  auditLog,
  sanitizeResponse,
};
