const rateLimit = require('express-rate-limit');
const mongoose  = require('mongoose');

// ─────────────────────────────────────────────────────────────
// 1. KYC GATE
// Blocks any route if the user has not completed KYC
// ─────────────────────────────────────────────────────────────
const requireKYC = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
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
// Blocks purchase if key profile fields are missing
// ─────────────────────────────────────────────────────────────
const requireCompleteProfile = (req, res, next) => {
  const u = req.user;
  const missing = [];
  if (!u.phone)               missing.push('phone number');
  if (!u.dateOfBirth)         missing.push('date of birth');
  if (!u.address?.state)      missing.push('state of residence');

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
// For payments above threshold, require re-auth confirmation
// The client must send { confirmPassword: true } header
// ─────────────────────────────────────────────────────────────
const HIGH_VALUE_THRESHOLD = 100000; // ₦100,000

const requireReAuthForHighValue = async (req, res, next) => {
  const amount = req.body.amount || 0;
  if (amount < HIGH_VALUE_THRESHOLD) return next();

  // Check for re-auth confirmation token in header
  const reAuthToken = req.headers['x-reauth-confirmed'];
  if (!reAuthToken || reAuthToken !== 'true') {
    return res.status(402).json({
      success:   false,
      code:      'REAUTH_REQUIRED',
      message:   `Transactions above ₦${HIGH_VALUE_THRESHOLD.toLocaleString()} require password confirmation.`,
      threshold: HIGH_VALUE_THRESHOLD,
      amount,
    });
  }
  next();
};

// ─────────────────────────────────────────────────────────────
// 4. PAYMENT IDEMPOTENCY CHECK
// Prevent duplicate payments for the same policy
// ─────────────────────────────────────────────────────────────
const preventDuplicatePayment = async (req, res, next) => {
  try {
    const Payment = mongoose.model('Payment');
    const { policyId } = req.body;

    if (!policyId) return next();

    // Check for a pending payment created in the last 10 minutes
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
    next(); // Don't block payment on check failure
  }
};

// ─────────────────────────────────────────────────────────────
// 5. STRICT RATE LIMITERS
// ─────────────────────────────────────────────────────────────

// Auth routes — 5 attempts per 15 min (brute force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  // In dev: 100 attempts. In production: 10 attempts per 15 min
  max: process.env.NODE_ENV === 'production' ? 10 : 100,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    code:    'TOO_MANY_ATTEMPTS',
    message: 'Too many login attempts. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders:   false,
});

// Payment routes — 10 per 15 min
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 20 : 200,
  message: {
    success: false,
    code:    'TOO_MANY_REQUESTS',
    message: 'Too many payment requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders:   false,
});

// OTP routes — 3 per 15 min
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  // In dev: 50 attempts. In production: 5 per 15 min
  max: process.env.NODE_ENV === 'production' ? 5 : 50,
  message: {
    success: false,
    code:    'TOO_MANY_OTP_REQUESTS',
    message: 'Too many OTP requests. Please wait 15 minutes before requesting again.',
  },
  standardHeaders: true,
  legacyHeaders:   false,
});

// General API — 100 per 15 min
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 300 : 2000,
  // Skip rate limiting for:
  // - Any admin endpoint
  // - /users/me (called on every page load for auth rehydration)
  // - health check
  skip: (req) => {
    const path = req.originalUrl || '';
    return (
      path.includes('/admin/') ||
      path.endsWith('/users/me') ||
      path.endsWith('/api/health')
    );
  },
  message: {
    success: false,
    code:    'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests from this IP. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders:   false,
});

// ─────────────────────────────────────────────────────────────
// 6. AUDIT LOGGER
// Logs sensitive actions to console (extend to DB collection later)
// ─────────────────────────────────────────────────────────────
const auditLog = (action) => (req, res, next) => {
  const ip        = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'] || 'unknown';
  const userId    = req.user?._id || 'unauthenticated';
  console.log(
    `[AUDIT] ${new Date().toISOString()} | ${action} | user:${userId} | ip:${ip} | ua:${userAgent.slice(0,60)}`
  );
  next();
};

// ─────────────────────────────────────────────────────────────
// 7. SANITIZE RESPONSE — strip sensitive fields from any response
// Applied as a response interceptor via middleware
// ─────────────────────────────────────────────────────────────
const SENSITIVE_FIELDS = ['password', 'otp', 'refreshTokens', '__v'];

const sanitizeResponse = (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (body && typeof body === 'object') {
      body = stripSensitive(body);
    }
    return originalJson(body);
  };
  next();
};

function stripSensitive(obj) {
  if (Array.isArray(obj)) return obj.map(stripSensitive);
  if (obj && typeof obj === 'object') {
    const clean = {};
    for (const [k, v] of Object.entries(obj)) {
      if (!SENSITIVE_FIELDS.includes(k)) {
        clean[k] = stripSensitive(v);
      }
    }
    return clean;
  }
  return obj;
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
