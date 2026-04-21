const mongoose = require('mongoose');

const coverageDetailSchema = new mongoose.Schema({
  key:   { type: String, required: true },
  value: { type: String, required: true },
}, { _id: false });

const policySchema = new mongoose.Schema({
  policyNumber: {
    type:    String,
    unique:  true,
    // auto-generated before save
  },
  user: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: [true, 'Policy must belong to a user'],
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref:  'User',
    default: null,
  },

  // ── Product ──────────────────────────────────────────────
  type: {
    type:     String,
    enum:     ['motor', 'health', 'life', 'travel', 'property', 'business', 'corporate'],
    required: [true, 'Policy type is required'],
  },
  subType: {
    type: String,
    // e.g. 'comprehensive' | 'third_party' for motor
    //      'individual'    | 'group'       for health
  },
  insurerName: {
    type:    String,
    default: 'Pending assignment',
  },

  // ── Status ───────────────────────────────────────────────
  status: {
    type:    String,
    enum:    ['draft', 'pending_payment', 'active', 'expired', 'cancelled', 'suspended'],
    default: 'draft',
  },

  // ── Dates ────────────────────────────────────────────────
  startDate: { type: Date },
  endDate:   { type: Date },

  // ── Premium ──────────────────────────────────────────────
  premium: {
    amount:    { type: Number, required: [true, 'Premium amount is required'], min: 0 },
    currency:  { type: String, default: 'NGN' },
    frequency: { type: String, enum: ['annual', 'quarterly', 'monthly'], default: 'annual' },
  },
  sumInsured: { type: Number, default: 0 },

  // ── Coverage Details (flexible key-value) ────────────────
  coverageDetails: [coverageDetailSchema],

  // ── Motor-specific ───────────────────────────────────────
  vehicle: {
    make:         String,
    model:        String,
    year:         Number,
    plateNumber:  String,
    engineNumber: String,
    chassisNumber:String,
    color:        String,
    value:        Number,
  },

  // ── Health/Life-specific ─────────────────────────────────
  beneficiaries: [{
    name:         String,
    relationship: String,
    percentage:   Number,
    phone:        String,
  }],

  // ── Travel-specific ──────────────────────────────────────
  travel: {
    destination:   String,
    departureDate: Date,
    returnDate:    Date,
    travellers:    Number,
  },

  // ── Property-specific ────────────────────────────────────
  property: {
    address:      String,
    propertyType: { type: String, enum: ['residential', 'commercial', 'industrial'] },
    value:        Number,
  },

  // ── Documents ────────────────────────────────────────────
  documents: [{
    name:       String,
    url:        String,
    type:       { type: String, enum: ['certificate', 'schedule', 'receipt', 'endorsement', 'other'] },
    uploadedAt: { type: Date, default: Date.now },
  }],

  // ── Payment tracking ─────────────────────────────────────
  lastPaymentDate:  Date,
  nextPaymentDate:  Date,
  totalPaid:        { type: Number, default: 0 },

  // ── Renewal ──────────────────────────────────────────────
  renewalReminder:  { type: Boolean, default: true },
  autoRenew:        { type: Boolean, default: false },

  notes: String,

}, { timestamps: true });

// ── Indexes ──────────────────────────────────────────────────
policySchema.index({ user: 1, status: 1 });
policySchema.index({ type: 1 });
policySchema.index({ endDate: 1 });

// ── Auto-generate policy number ───────────────────────────────
policySchema.pre('save', async function (next) {
  if (this.policyNumber) return next();

  const typeCode = {
    motor:    'MOT',
    health:   'HLT',
    life:     'LIF',
    travel:   'TRV',
    property: 'PRP',
    business: 'BUS',
    corporate:'CRP',
  }[this.type] || 'POL';

  const year  = new Date().getFullYear();
  const count = await mongoose.model('Policy').countDocuments();
  this.policyNumber = `GAIB-${typeCode}-${year}-${String(count + 1).padStart(5, '0')}`;
  next();
});

// ── Virtual: is expired? ─────────────────────────────────────
policySchema.virtual('isExpired').get(function () {
  return this.endDate && this.endDate < new Date();
});

// ── Auto-expire active policies whose end date has passed ────
policySchema.pre('find', function () {
  // handled via a scheduled job ideally; this is just a note
});

module.exports = mongoose.model('Policy', policySchema);
