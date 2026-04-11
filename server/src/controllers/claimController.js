const { validationResult } = require('express-validator');
const Claim  = require('../models/Claim');
const Policy = require('../models/Policy');
const { sendClaimNotification } = require('../services/emailService');

const paginate = (page = 1, limit = 10) => {
  const p = Math.max(1, parseInt(page));
  const l = Math.min(50, Math.max(1, parseInt(limit)));
  return { skip: (p - 1) * l, limit: l, page: p };
};

// ────────────────────────────────────────────────────────────
// @desc    Get all claims for logged-in user
// @route   GET /api/claims
// @access  Private
// ────────────────────────────────────────────────────────────
const getMyClaims = async (req, res) => {
  try {
    const { status, type, page, limit } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;
    if (type)   filter.type   = type;

    const { skip, limit: lim, page: p } = paginate(page, limit);

    const [claims, total] = await Promise.all([
      Claim.find(filter)
        .populate('policy', 'policyNumber type status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(lim)
        .lean(),
      Claim.countDocuments(filter),
    ]);

    res.json({ success: true, count: claims.length, total, pages: Math.ceil(total / lim), page: p, data: claims });
  } catch (error) {
    console.error('getMyClaims error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch claims' });
  }
};

// ────────────────────────────────────────────────────────────
// @desc    Get single claim by ID
// @route   GET /api/claims/:id
// @access  Private (owner or admin)
// ────────────────────────────────────────────────────────────
const getClaimById = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate('user',       'firstName lastName email phone')
      .populate('policy',     'policyNumber type premium startDate endDate')
      .populate('assignedTo', 'firstName lastName email');

    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found' });
    }

    const isOwner = claim.user._id.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: claim });
  } catch (error) {
    console.error('getClaimById error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch claim' });
  }
};

// ────────────────────────────────────────────────────────────
// @desc    Submit a new claim
// @route   POST /api/claims
// @access  Private (customers)
// ────────────────────────────────────────────────────────────
const submitClaim = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const {
      policyId, type, incidentDate, incidentLocation,
      description, claimedAmount, documents,
    } = req.body;

    // Verify the policy exists and belongs to this user
    const policy = await Policy.findById(policyId);
    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }
    if (policy.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'This policy does not belong to you' });
    }
    if (policy.status !== 'active') {
      return res.status(400).json({ success: false, message: `Cannot file a claim on a policy with status: ${policy.status}` });
    }

    // Check for duplicate open claim on same policy
    const existingOpen = await Claim.findOne({
      policy: policyId,
      user:   req.user._id,
      status: { $in: ['submitted', 'under_review', 'assessment'] },
    });
    if (existingOpen) {
      return res.status(400).json({
        success: false,
        message: `You already have an open claim (${existingOpen.claimNumber}) on this policy. Please wait for it to be resolved.`,
      });
    }

    const claim = await Claim.create({
      user:             req.user._id,
      policy:           policyId,
      type:             type || policy.type,
      incidentDate,
      incidentLocation,
      description,
      claimedAmount,
      documents:        documents || [],
      status:           'submitted',
    });

    // Notify user by email (non-blocking)
    sendClaimNotification(req.user.email, req.user.firstName, claim).catch(console.error);

    res.status(201).json({
      success: true,
      message: `Claim ${claim.claimNumber} submitted successfully. You will be notified of updates.`,
      data:    claim,
    });
  } catch (error) {
    console.error('submitClaim error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit claim' });
  }
};

// ────────────────────────────────────────────────────────────
// @desc    Update claim (customer can only add documents / notes)
// @route   PUT /api/claims/:id
// @access  Private
// ────────────────────────────────────────────────────────────
const updateClaim = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found' });
    }

    const isOwner = claim.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (isOwner && !isAdmin) {
      // Customers can only add documents while claim is still submitted
      if (!['submitted', 'under_review'].includes(claim.status)) {
        return res.status(400).json({
          success: false,
          message: 'You cannot modify a claim that is in assessment or beyond.',
        });
      }
      // Only allow adding documents
      if (req.body.documents) {
        claim.documents.push(...req.body.documents);
        await claim.save();
        return res.json({ success: true, message: 'Documents added to claim', data: claim });
      }
      return res.status(400).json({ success: false, message: 'Customers can only add documents to a claim' });
    }

    // Admin can update status, approvedAmount, assignedTo, adminNotes, rejectionReason
    const adminFields = ['status', 'approvedAmount', 'assignedTo', 'adminNotes', 'rejectionReason', 'paymentReference', 'paymentMethod'];
    const updates = {};
    adminFields.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    // Handle status transitions + timeline
    if (req.body.status && req.body.status !== claim.status) {
      const messages = {
        under_review: 'Your claim is now under review by our claims team.',
        assessment:   'Your claim has moved to the assessment stage. An adjuster will contact you shortly.',
        approved:     `Your claim has been approved for ${req.body.approvedAmount || claim.approvedAmount} NGN.`,
        rejected:     `Your claim has been rejected. Reason: ${req.body.rejectionReason || 'See admin notes.'}`,
        paid:         'Payment has been processed. Please check your account within 3–5 business days.',
        closed:       'This claim has been closed.',
      };

      claim.timeline.push({
        status:    req.body.status,
        message:   messages[req.body.status] || `Status updated to ${req.body.status}`,
        updatedBy: req.user._id,
      });

      // Set resolution timestamps
      if (['approved', 'rejected'].includes(req.body.status)) updates.reviewedAt  = new Date();
      if (['paid', 'closed'].includes(req.body.status))        updates.resolvedAt = new Date();
      if (req.body.status === 'paid')                          updates.paidAt     = new Date();
    }

    Object.assign(claim, updates);
    await claim.save();

    res.json({ success: true, message: 'Claim updated', data: claim });
  } catch (error) {
    console.error('updateClaim error:', error);
    res.status(500).json({ success: false, message: 'Failed to update claim' });
  }
};

// ────────────────────────────────────────────────────────────
// @desc    Withdraw / cancel a submitted claim (customer)
// @route   DELETE /api/claims/:id
// @access  Private (owner only, only if submitted)
// ────────────────────────────────────────────────────────────
const withdrawClaim = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found' });
    }

    if (claim.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (claim.status !== 'submitted') {
      return res.status(400).json({
        success: false,
        message: 'Only submitted claims can be withdrawn. Contact support for further assistance.',
      });
    }

    claim.status = 'closed';
    claim.timeline.push({
      status:    'closed',
      message:   'Claim withdrawn by customer.',
      updatedBy: req.user._id,
    });
    await claim.save();

    res.json({ success: true, message: 'Claim withdrawn successfully', data: claim });
  } catch (error) {
    console.error('withdrawClaim error:', error);
    res.status(500).json({ success: false, message: 'Failed to withdraw claim' });
  }
};

// ────────────────────────────────────────────────────────────
// @desc    Get all claims — admin
// @route   GET /api/claims/admin/all
// @access  Private (admin)
// ────────────────────────────────────────────────────────────
const getAllClaims = async (req, res) => {
  try {
    const { status, type, assignedTo, page, limit } = req.query;
    const filter = {};
    if (status)     filter.status     = status;
    if (type)       filter.type       = type;
    if (assignedTo) filter.assignedTo = assignedTo;

    const { skip, limit: lim, page: p } = paginate(page, limit);

    const [claims, total] = await Promise.all([
      Claim.find(filter)
        .populate('user',   'firstName lastName email phone')
        .populate('policy', 'policyNumber type')
        .populate('assignedTo', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(lim)
        .lean(),
      Claim.countDocuments(filter),
    ]);

    res.json({ success: true, count: claims.length, total, pages: Math.ceil(total / lim), page: p, data: claims });
  } catch (error) {
    console.error('getAllClaims error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch claims' });
  }
};

// ────────────────────────────────────────────────────────────
// @desc    Get claim statistics — admin
// @route   GET /api/claims/admin/stats
// @access  Private (admin)
// ────────────────────────────────────────────────────────────
const getClaimStats = async (req, res) => {
  try {
    const [byStatus, byType, totals] = await Promise.all([
      Claim.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 }, totalClaimed: { $sum: '$claimedAmount' }, totalApproved: { $sum: '$approvedAmount' } } },
      ]),
      Claim.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort:  { count: -1 } },
      ]),
      Claim.aggregate([
        { $group: {
          _id:            null,
          totalClaims:    { $sum: 1 },
          totalClaimed:   { $sum: '$claimedAmount' },
          totalApproved:  { $sum: '$approvedAmount' },
          avgClaimed:     { $avg: '$claimedAmount' },
        }},
      ]),
    ]);

    const pendingReview = await Claim.countDocuments({ status: { $in: ['submitted', 'under_review'] } });

    res.json({
      success: true,
      data: { byStatus, byType, totals: totals[0] || {}, pendingReview },
    });
  } catch (error) {
    console.error('getClaimStats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch claim stats' });
  }
};

module.exports = {
  getMyClaims, getClaimById, submitClaim,
  updateClaim, withdrawClaim,
  getAllClaims, getClaimStats,
};
