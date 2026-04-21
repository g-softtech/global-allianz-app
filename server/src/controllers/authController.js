const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { generateOTP, sendOTPEmail } = require('../services/emailService');

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MINUTES  = 15;

const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

const generateRefreshToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d',
  });

// ── Register ──────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { email, password, firstName, lastName, phone } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { phone }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email.toLowerCase()
          ? 'Email already registered'
          : 'Phone number already registered',
      });
    }

    const user = await User.create({
      email: email.toLowerCase(),
      password, firstName, lastName, phone,
    });

    // Generate & send OTP
    const otp = generateOTP();
    user.otp = { code: otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) };
    await user.save();

    try { await sendOTPEmail(user.email, otp); } catch (e) {
      console.error('OTP email failed:', e.message);
    }

    const token        = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email.',
      data: {
        user: {
          id: user._id, email: user.email,
          firstName: user.firstName, lastName: user.lastName,
          phone: user.phone, role: user.role, kycVerified: user.kycVerified,
        },
        token, refreshToken,
      },
    });
  } catch (error) {
    console.error('register error:', error);
    res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
};

// ── Login (with brute-force tracking) ─────────────────────────
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+password +loginAttempts +lockUntil'
    );

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // ── Account lock check ──────────────────────────────────
    if (user.lockUntil && user.lockUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({
        success: false,
        code:    'ACCOUNT_LOCKED',
        message: `Account locked due to too many failed attempts. Try again in ${minutesLeft} minute(s).`,
      });
    }

    // ── Password check ──────────────────────────────────────
    const isValid = await user.comparePassword(password);

    if (!isValid) {
      // Increment failed attempts
      user.loginAttempts = (user.loginAttempts || 0) + 1;

      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockUntil     = new Date(Date.now() + LOCK_TIME_MINUTES * 60 * 1000);
        user.loginAttempts = 0;
        await user.save();
        return res.status(423).json({
          success: false,
          code:    'ACCOUNT_LOCKED',
          message: `Account locked for ${LOCK_TIME_MINUTES} minutes after ${MAX_LOGIN_ATTEMPTS} failed attempts.`,
        });
      }

      await user.save();
      const remaining = MAX_LOGIN_ATTEMPTS - user.loginAttempts;
      return res.status(401).json({
        success: false,
        message: `Invalid email or password. ${remaining} attempt(s) remaining before account lock.`,
      });
    }

    // ── Success — reset attempt counter ─────────────────────
    user.loginAttempts = 0;
    user.lockUntil     = undefined;

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account deactivated. Contact support.' });
    }

    const token        = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshTokens.push({ token: refreshToken });
    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id, email: user.email,
          firstName: user.firstName, lastName: user.lastName,
          phone: user.phone, role: user.role,
          kycVerified: user.kycVerified, profileComplete: user.profileComplete,
        },
        token, refreshToken,
      },
    });
  } catch (error) {
    console.error('login error:', error);
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
};

// ── Verify OTP ────────────────────────────────────────────────
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (!user.otp?.code) return res.status(400).json({ success: false, message: 'No OTP found. Request a new one.' });
    if (user.otp.expiresAt < new Date()) return res.status(400).json({ success: false, message: 'OTP has expired. Request a new one.' });
    if (user.otp.code !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP' });

    user.otp = undefined;
    await user.save();

    res.json({ success: true, message: 'Email verified successfully.' });
  } catch (error) {
    console.error('verifyOTP error:', error);
    res.status(500).json({ success: false, message: 'OTP verification failed' });
  }
};

// ── Resend OTP ────────────────────────────────────────────────
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const otp = generateOTP();
    user.otp  = { code: otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) };
    await user.save();

    await sendOTPEmail(user.email, otp);
    res.json({ success: true, message: 'OTP sent. Please check your email.' });
  } catch (error) {
    console.error('resendOTP error:', error);
    res.status(500).json({ success: false, message: 'Failed to resend OTP' });
  }
};

// ── Refresh Token ─────────────────────────────────────────────
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ success: false, message: 'Refresh token required' });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user    = await User.findById(decoded.userId);

    if (!user || !user.refreshTokens.some(t => t.token === refreshToken)) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    // Rotate — remove old, add new
    user.refreshTokens = user.refreshTokens.filter(t => t.token !== refreshToken);
    const newToken        = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);
    user.refreshTokens.push({ token: newRefreshToken });
    await user.save();

    res.json({ success: true, data: { token: newToken, refreshToken: newRefreshToken } });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};

// ── Logout ────────────────────────────────────────────────────
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const user = await User.findById(req.user._id);

    if (user && refreshToken) {
      user.refreshTokens = user.refreshTokens.filter(t => t.token !== refreshToken);
      await user.save();
    }

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Logout failed' });
  }
};

module.exports = { register, login, verifyOTP, resendOTP, refreshToken, logout };
