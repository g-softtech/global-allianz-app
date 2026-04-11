const mongoose = require('mongoose');

const timelineEventSchema = new mongoose.Schema({
  status:    { type: String, required: true },
  message:   { type: String, required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date:      { type: Date, default: Date.now },
}, { _id: false });

const documentSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  url:        { type: String, required: true },
  type:       {
    type: String,
    enum: ['police_report', 'medical_report', 'photos', 'invoice', 'receipt', 'other'],
    default: 'other',
  },
  uploadedAt: { type: Date, default: Date.now },
}, { _id: false });

const claimSchema = new mongoose.Schema({

  claimNumber: {
    type:   String,
    unique: true,
    // auto-generated before save
  },

  // ── Relations ────────────────────────────────────────────
  user: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: [true, 'Claim must belong to a user'],
  },
  policy: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'Policy',
    required: [true, 'Claim must be linked to a policy'],
  },
  assignedTo: {
    // Claims officer (admin) handling this claim
    type:    mongoose.Schema.Types.ObjectId,
    ref:     'User',
    default: null,
  },

  // ── Core Fields ──────────────────────────────────────────
  type: {
    // mirrors policy type for quick filtering
    type: String,
    enum: ['motor', 'health', 'life', 'travel', 'property', 'business', 'corporate'],
    required: true,
  },
  incidentDate: {
    type:     Date,
    required: [true, 'Incident date is required'],
  },
  incidentLocation: String,
  description: {
    type:      String,
    required:  [true, 'Claim description is required'],
    minlength: [20, 'Please provide a detailed description (min 20 characters)'],
  },

  // ── Financial ────────────────────────────────────────────
  claimedAmount: {
    type:     Number,
    required: [true, 'Claimed amount is required'],
    min:      [1,    'Claimed amount must be greater than 0'],
  },
  approvedAmount: {
    type:    Number,
    default: 0,
  },
  currency: { type: String, default: 'NGN' },

  // ── Status ───────────────────────────────────────────────
  status: {
    type:    String,
    enum:    ['submitted', 'under_review', 'assessment', 'approved', 'rejected', 'paid', 'closed'],
    default: 'submitted',
  },
  rejectionReason: String,
  adminNotes:      String,

  // ── Documents ────────────────────────────────────────────
  documents: [documentSchema],

  // ── Timeline / Audit trail ────────────────────────────────
  timeline: [timelineEventSchema],

  // ── Dates ────────────────────────────────────────────────
  submittedAt:  { type: Date, default: Date.now },
  reviewedAt:   Date,
  resolvedAt:   Date,
  paidAt:       Date,

  // ── Payment details (when settled) ───────────────────────
  paymentReference: String,
  paymentMethod:    String,

}, { timestamps: true });

// ── Indexes ───────────────────────────────────────────────────
claimSchema.index({ user:   1, status: 1 });
claimSchema.index({ policy: 1 });
claimSchema.index({ claimNumber: 1 });
claimSchema.index({ status: 1, createdAt: -1 });

// ── Auto-generate claim number ────────────────────────────────
claimSchema.pre('save', async function (next) {
  if (this.claimNumber) return next();
  const year  = new Date().getFullYear();
  const count = await mongoose.model('Claim').countDocuments();
  this.claimNumber = `GAIB-CLM-${year}-${String(count + 1).padStart(5, '0')}`;
  next();
});

// ── Auto-push first timeline event on create ──────────────────
claimSchema.pre('save', function (next) {
  if (this.isNew) {
    this.timeline.push({
      status:  'submitted',
      message: 'Claim submitted successfully. Our team will review within 24–48 hours.',
    });
  }
  next();
});

module.exports = mongoose.model('Claim', claimSchema);
