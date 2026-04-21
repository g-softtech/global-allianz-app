const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const { authLimiter, otpLimiter, auditLog } = require('../middleware/security');
const {
  register, login, verifyOTP, resendOTP, refreshToken, logout,
} = require('../controllers/authController');

const router = express.Router();

const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('lastName').trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('phone').matches(/^\+?[\d\s\-\(\)]+$/).withMessage('Valid phone number required'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Public — with strict rate limiting
router.post('/register', authLimiter, auditLog('REGISTER_ATTEMPT'), registerValidation, register);
router.post('/login',    authLimiter, auditLog('LOGIN_ATTEMPT'),    loginValidation,    login);

// OTP — very strict
router.post('/verify-otp', otpLimiter, [
  body('email').isEmail().withMessage('Valid email required'),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric().withMessage('Valid 6-digit OTP required'),
], verifyOTP);
router.post('/resend-otp', otpLimiter, [
  body('email').isEmail().withMessage('Valid email required'),
], resendOTP);

// Token refresh
router.post('/refresh', refreshToken);

// Protected
router.post('/logout', protect, auditLog('LOGOUT'), logout);

module.exports = router;
