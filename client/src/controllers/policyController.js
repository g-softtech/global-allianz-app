const { validationResult } = require('express-validator');
const Policy = require('../models/Policy');

// ─── helpers ────────────────────────────────────────────────
const paginate = (query, page = 1, limit = 10) => {
  const p = Math.max(1, parseInt(page));
  const l = Math.min(50, Math.max(1, parseInt(limit)));
  return { skip: (p - 1) * l, limit: l, page: p };
};

// ────────────────────────────────────────────────────────────
// @desc    Get all policies for the logged-in user
// @route   GET /api/policies
// @access  Private
// ────────────────────────────────────────────────────────────
const getMyPolicies = async (req, res) => {
  try {
    const { status, type, page, limit } = req.query;
    const filter = { user: req.user._id };

    if (status) filter.status = status;
    if (type)   filter.type   = type;

    const { skip, limit: lim, page: p } = paginate(page, limit);

    const [policies, total] = await Promise.all([
      Policy.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(lim)
        .lean(),
      Policy.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count:   policies.length,
      total,
      pages:   Math.ceil(total / lim),
      page:    p,
      data:    policies,
    });
  } catch (error) {
    console.error('getMyPolicies error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch policies' });
  }
};

// ────────────────────────────────────────────────────────────
// @desc    Get single policy by ID
// @route   GET /api/policies/:id
// @access  Private (owner or admin)
// ────────────────────────────────────────────────────────────
const getPolicyById = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id)
      .populate('user',  'firstName lastName email phone')
      .populate('agent', 'firstName lastName email phone');

    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }

    // Ownership check — admins can see all
    if (req.user.role !== 'admin' && policy.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this policy' });
    }

    res.json({ success: true, data: policy });
  } catch (error) {
    console.error('getPolicyById error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch policy' });
  }
};

// ────────────────────────────────────────────────────────────
// @desc    Create (request) a new policy
// @route   POST /api/policies
// @access  Private (customers & agents)
// ────────────────────────────────────────────────────────────
const createPolicy = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors:  errors.array(),
      });
    }

    const {
      type, subType, insurerName, startDate, endDate,
      premium, sumInsured, coverageDetails,
      vehicle, beneficiaries, travel, property,
      notes,
    } = req.body;

    const policy = await Policy.create({
      user:    req.user._id,
      type, subType, insurerName,
      startDate, endDate,
      premium, sumInsured, coverageDetails,
      vehicle, beneficiaries, travel, property,
      notes,
      status: 'pending_payment',
    });

    res.status(201).json({
      success: true,
      message: 'Policy request submitted. Proceed to payment to activate.',
      data:    policy,
    });
  } catch (error) {
    console.error('createPolicy error:', error);
    res.status(500).json({ success: false, message: 'Failed to create policy' });
  }
};

// ────────────────────────────────────────────────────────────
// @desc    Update policy details (limited fields for customers)
// @route   PUT /api/policies/:id
// @access  Private (owner limited | admin full)
// ────────────────────────────────────────────────────────────
const updatePolicy = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);
    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }

    const isAdmin = req.user.role === 'admin';
    const isOwner = policy.user.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Customers can only update notes, beneficiaries, renewalReminder, autoRenew
    const customerAllowed = ['notes', 'beneficiaries', 'renewalReminder', 'autoRenew'];
    const adminOnly       = ['status', 'insurerName', 'startDate', 'endDate', 'premium',
                             'sumInsured', 'coverageDetails', 'documents', 'agent',
                             'lastPaymentDate', 'nextPaymentDate', 'totalPaid'];

    const updates = {};
    if (isAdmin) {
      [...customerAllowed, ...adminOnly].forEach(k => {
        if (req.body[k] !== undefined) updates[k] = req.body[k];
      });
    } else {
      customerAllowed.forEach(k => {
        if (req.body[k] !== undefined) updates[k] = req.body[k];
      });
    }

    const updated = await Policy.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({ success: true, message: 'Policy updated', data: updated });
  } catch (error) {
    console.error('updatePolicy error:', error);
    res.status(500).json({ success: false, message: 'Failed to update policy' });
  }
};

// ────────────────────────────────────────────────────────────
// @desc    Cancel a policy
// @route   DELETE /api/policies/:id
// @access  Private (owner or admin)
// ────────────────────────────────────────────────────────────
const cancelPolicy = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);
    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }

    const isAdmin = req.user.role === 'admin';
    const isOwner = policy.user.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (policy.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Policy is already cancelled' });
    }

    policy.status = 'cancelled';
    await policy.save();

    res.json({ success: true, message: 'Policy cancelled successfully', data: policy });
  } catch (error) {
    console.error('cancelPolicy error:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel policy' });
  }
};

// ────────────────────────────────────────────────────────────
// @desc    Get all policies (admin only)
// @route   GET /api/policies/admin/all
// @access  Private (admin only)
// ────────────────────────────────────────────────────────────
const getAllPolicies = async (req, res) => {
  try {
    const { status, type, user, page, limit, search } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (type)   filter.type   = type;
    if (user)   filter.user   = user;

    const { skip, limit: lim, page: p } = paginate(page, limit);

    const [policies, total] = await Promise.all([
      Policy.find(filter)
        .populate('user', 'firstName lastName email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(lim)
        .lean(),
      Policy.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count:   policies.length,
      total,
      pages:   Math.ceil(total / lim),
      page:    p,
      data:    policies,
    });
  } catch (error) {
    console.error('getAllPolicies error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch policies' });
  }
};

// ────────────────────────────────────────────────────────────
// @desc    Get policy stats summary (admin)
// @route   GET /api/policies/admin/stats
// @access  Private (admin only)
// ────────────────────────────────────────────────────────────
const getPolicyStats = async (req, res) => {
  try {
    const stats = await Policy.aggregate([
      {
        $group: {
          _id:          '$status',
          count:        { $sum: 1 },
          totalPremium: { $sum: '$premium.amount' },
        },
      },
    ]);

    const byType = await Policy.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort:  { count: -1 } },
    ]);

    const expiringSoon = await Policy.countDocuments({
      status:  'active',
      endDate: { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    });

    res.json({
      success: true,
      data: { byStatus: stats, byType, expiringSoon },
    });
  } catch (error) {
    console.error('getPolicyStats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
};

// ────────────────────────────────────────────────────────────
// @desc    Renew a policy (extend end date, create new premium)
// @route   POST /api/policies/:id/renew
// @access  Private (owner or admin)
// ────────────────────────────────────────────────────────────
const renewPolicy = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);
    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }

    const isOwner = policy.user.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (!['active', 'expired'].includes(policy.status)) {
      return res.status(400).json({ success: false, message: `Cannot renew a policy with status: ${policy.status}` });
    }

    // Extend by 1 year from current end date or today
    const base    = policy.endDate > new Date() ? policy.endDate : new Date();
    const newEnd  = new Date(base);
    newEnd.setFullYear(newEnd.getFullYear() + 1);

    policy.startDate = base;
    policy.endDate   = newEnd;
    policy.status    = 'pending_payment';
    await policy.save();

    res.json({
      success: true,
      message: 'Policy renewal initiated. Please complete payment to activate.',
      data:    policy,
    });
  } catch (error) {
    console.error('renewPolicy error:', error);
    res.status(500).json({ success: false, message: 'Failed to renew policy' });
  }
};

module.exports = {
  getMyPolicies,
  getPolicyById,
  createPolicy,
  updatePolicy,
  cancelPolicy,
  getAllPolicies,
  getPolicyStats,
  renewPolicy,
};
