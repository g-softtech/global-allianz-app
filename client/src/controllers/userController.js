const User = require('../models/User');

// ────────────────────────────────────────────────────────────
// @desc    Get logged-in user's profile
// @route   GET /api/users/me
// @access  Private
// ────────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
};

// ────────────────────────────────────────────────────────────
// @desc    Update logged-in user's profile
// @route   PUT /api/users/profile
// @access  Private
// ────────────────────────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    // Fields user is allowed to update themselves
    const allowed = ['firstName', 'lastName', 'phone', 'dateOfBirth', 'occupation', 'address'];
    const updates = {};
    allowed.forEach(k => {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    });

    // Prevent updating email, password, role, kycVerified via this route
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    // Mark profile as complete if key fields are filled
    if (user.firstName && user.lastName && user.phone &&
        user.dateOfBirth && user.address?.street && user.address?.state) {
      user.profileComplete = true;
      await user.save();
    }

    res.json({ success: true, message: 'Profile updated successfully', data: user });
  } catch (error) {
    console.error('updateProfile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

// ────────────────────────────────────────────────────────────
// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
// ────────────────────────────────────────────────────────────
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both current and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    // Fetch with password field
    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword; // hashed by pre-save hook
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('changePassword error:', error);
    res.status(500).json({ success: false, message: 'Failed to change password' });
  }
};

// ────────────────────────────────────────────────────────────
// @desc    Submit KYC documents (stores file URLs)
// @route   POST /api/users/kyc
// @access  Private
// ────────────────────────────────────────────────────────────
const submitKYC = async (req, res) => {
  try {
    const { documents } = req.body;
    // documents: [{ type: 'id_card', url: '...' }, ...]

    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one document is required' });
    }

    const user = await User.findById(req.user._id);

    // Add new docs (avoid duplicates by type)
    documents.forEach(doc => {
      const existing = user.kycDocuments.findIndex(d => d.type === doc.type);
      if (existing >= 0) {
        user.kycDocuments[existing] = { ...doc, verified: false, uploadedAt: new Date() };
      } else {
        user.kycDocuments.push({ ...doc, verified: false });
      }
    });

    await user.save();

    res.json({
      success: true,
      message: 'KYC documents submitted. Our team will verify within 24–48 hours.',
      data:    { kycDocuments: user.kycDocuments, kycVerified: user.kycVerified },
    });
  } catch (error) {
    console.error('submitKYC error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit KYC documents' });
  }
};

// ─────────────────────────────────────────────────────────────
// ADMIN ROUTES
// ─────────────────────────────────────────────────────────────

// @desc    Get all users (admin)
// @route   GET /api/users
// @access  Private (admin)
const getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName:  { $regex: search, $options: 'i' } },
        { email:     { $regex: search, $options: 'i' } },
      ];
    }

    const p = Math.max(1, parseInt(page));
    const l = Math.min(50, parseInt(limit));

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip((p - 1) * l).limit(l),
      User.countDocuments(filter),
    ]);

    res.json({ success: true, count: users.length, total, pages: Math.ceil(total / l), page: p, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

// @desc    Get single user (admin)
// @route   GET /api/users/:id
// @access  Private (admin)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user' });
  }
};

// @desc    Update user (admin — can set role, kycVerified, isActive)
// @route   PUT /api/users/:id
// @access  Private (admin)
const updateUser = async (req, res) => {
  try {
    const allowed = ['firstName', 'lastName', 'phone', 'role', 'kycVerified', 'isActive', 'occupation', 'address'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const user = await User.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, message: 'User updated', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update user' });
  }
};

// @desc    Approve / reject KYC (admin)
// @route   PUT /api/users/:id/kyc
// @access  Private (admin)
const reviewKYC = async (req, res) => {
  try {
    const { approved, notes } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.kycVerified = !!approved;
    user.kycDocuments = user.kycDocuments.map(doc => ({ ...doc.toObject(), verified: !!approved }));
    if (notes) user.notes = notes;
    await user.save();

    res.json({
      success: true,
      message: `KYC ${approved ? 'approved' : 'rejected'} successfully`,
      data:    { kycVerified: user.kycVerified },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update KYC status' });
  }
};

// @desc    Get user stats (admin dashboard)
// @route   GET /api/users/admin/stats
// @access  Private (admin)
const getUserStats = async (req, res) => {
  try {
    const [total, customers, agents, admins, kycPending, kycVerified, newThisMonth] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'agent' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ kycVerified: false, role: 'customer' }),
      User.countDocuments({ kycVerified: true }),
      User.countDocuments({ createdAt: { $gte: new Date(new Date().setDate(1)) } }),
    ]);

    res.json({
      success: true,
      data: { total, customers, agents, admins, kycPending, kycVerified, newThisMonth },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user stats' });
  }
};

module.exports = {
  getMe, updateProfile, changePassword, submitKYC,
  getAllUsers, getUserById, updateUser, reviewKYC, getUserStats,
};
