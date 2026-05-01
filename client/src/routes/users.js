const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Helper — audit log without dependency on security.js
const auditLog = (action) => (req, res, next) => {
  console.log(`[AUDIT] ${new Date().toISOString()} | ${action} | user:${req.user?._id} | ip:${req.ip}`);
  next();
};

// ── GET /api/users/me ─────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('GET /users/me error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
});

// ── GET /api/users/admin/stats ────────────────────────────────
router.get('/admin/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const now        = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, newThisMonth, kycPending, kycVerified] = await Promise.all([
      User.countDocuments({ role: { $ne: 'admin' } }),
      User.countDocuments({ createdAt: { $gte: monthStart }, role: { $ne: 'admin' } }),
      User.countDocuments({ kycVerified: false, 'kycDocuments.0': { $exists: true } }),
      User.countDocuments({ kycVerified: true }),
    ]);

    res.json({ success: true, data: { total, newThisMonth, kycPending, kycVerified } });
  } catch (error) {
    console.error('admin/stats error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

// ── GET /api/users/admin/all ──────────────────────────────────
router.get('/admin/all', protect, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 15, search, role } = req.query;
    const skip  = (Number(page) - 1) * Number(limit);
    const query = {};

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName:  { $regex: search, $options: 'i' } },
        { email:     { $regex: search, $options: 'i' } },
      ];
    }
    if (role) query.role = role;

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: { users, total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    console.error('admin/all error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

// ── PUT /api/users/profile ────────────────────────────────────
router.put('/profile', protect, async (req, res) => {
  try {
    const allowed = ['firstName', 'lastName', 'phone', 'dateOfBirth', 'occupation', 'address'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const user = await User.findByIdAndUpdate(
      req.user._id, updates, { new: true, runValidators: true }
    );
    res.json({ success: true, message: 'Profile updated successfully', data: user });
  } catch (error) {
    console.error('PUT /profile error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

// ── PUT /api/users/change-password ───────────────────────────
router.put('/change-password', protect, [
  body('currentPassword').notEmpty().withMessage('Current password required'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('change-password error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to change password' });
  }
});

// ── POST /api/users/kyc ───────────────────────────────────────
router.post('/kyc', protect, auditLog('KYC_SUBMISSION'), async (req, res) => {
  try {
    const { documents, nin } = req.body;

    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one document is required',
      });
    }

    // NIN required if id_card submitted
    const hasIdCard = documents.some(d => d.type === 'id_card');
    if (hasIdCard) {
      if (!nin) {
        return res.status(400).json({
          success: false,
          message: 'NIN (11 digits) is required when submitting a National ID Card.',
        });
      }
      if (!/^\d{11}$/.test(nin.toString().trim())) {
        return res.status(400).json({
          success: false,
          message: 'NIN must be exactly 11 digits with no spaces or letters.',
        });
      }
    }

    // File size validation
    const errors = [];
    for (const doc of documents) {
      if (!doc.type) {
        errors.push('Document type is required');
        continue;
      }
      if (doc.fileSize && doc.fileSize < 50 * 1024) {
        errors.push(`${doc.type.replace(/_/g, ' ')}: File too small (min 50KB). Upload a clear photo, not a screenshot.`);
      }
      if (doc.fileSize && doc.fileSize > 5 * 1024 * 1024) {
        errors.push(`${doc.type.replace(/_/g, ' ')}: File too large (max 5MB).`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors[0],
        errors,
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Add or update each document
    for (const doc of documents) {
      const idx = user.kycDocuments.findIndex(d => d.type === doc.type);
      const entry = {
        type:       doc.type,
        url:        doc.url || 'pending_upload',
        fileName:   doc.fileName || 'document',
        fileSize:   doc.fileSize || 0,
        mimeType:   doc.mimeType || 'application/octet-stream',
        verified:   false,
        uploadedAt: new Date(),
      };

      if (idx >= 0) {
        user.kycDocuments[idx] = entry;
      } else {
        user.kycDocuments.push(entry);
      }
    }

    if (nin) user.nin = nin.toString().trim();
    await user.save();

    console.log(`[KYC] ${user.email} submitted ${documents.length} document(s) for review`);

    res.json({
      success: true,
      message: 'Documents submitted successfully. Our compliance team will verify within 24–48 hours. You will be notified by email.',
      data: {
        kycDocuments: user.kycDocuments,
        kycVerified:  user.kycVerified,
      },
    });
  } catch (error) {
    console.error('KYC submission error:', error.message);
    console.error(error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to submit KYC documents. Please try again.',
    });
  }
});

// ── PUT /api/users/:id/kyc — Admin approve/reject ─────────────
router.put('/:id/kyc', protect, authorize('admin'), async (req, res) => {
  try {
    const { kycVerified } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.kycVerified = kycVerified;

    if (kycVerified) {
      user.kycVerifiedAt = new Date();
      user.kycDocuments.forEach(doc => { doc.verified = true; });
    }

    await user.save();

    // Send email notification (non-blocking)
    try {
      const { sendKYCApprovedEmail } = require('../services/emailService');
      if (kycVerified) sendKYCApprovedEmail(user.email, user.firstName).catch(() => {});
    } catch (e) {
      console.warn('KYC email not sent:', e.message);
    }

    res.json({
      success: true,
      message: `KYC ${kycVerified ? 'approved' : 'rejected'} successfully`,
      data: user,
    });
  } catch (error) {
    console.error('KYC update error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update KYC status' });
  }
});

// ── PUT /api/users/:id — Admin update user ────────────────────
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const allowed = ['role', 'isActive', 'firstName', 'lastName'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, message: 'User updated successfully', data: user });
  } catch (error) {
    console.error('PUT /:id error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update user' });
  }
});

// ── GET /api/users/:id — Admin get single user ────────────────
router.get('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user' });
  }
});

module.exports = router;
