const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type:     String,
    required: [true, 'Email is required'],
    unique:   true,
    lowercase: true,
    trim:     true,
    match:    [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  },
  password: {
    type:      String,
    required:  [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select:    false, // never returned by default
  },
  firstName:  { type: String, required: [true, 'First name is required'], trim: true },
  lastName:   { type: String, required: [true, 'Last name is required'],  trim: true },
  phone: {
    type:  String,
    required: [true, 'Phone number is required'],
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number'],
  },
  role: {
    type:    String,
    enum:    ['customer', 'admin', 'agent'],
    default: 'customer',
  },

  // ── Profile ───────────────────────────────────────────────
  dateOfBirth: Date,
  occupation:  String,
  address: {
    street:  String,
    city:    String,
    state:   String,
    zipCode: String,
    country: { type: String, default: 'Nigeria' },
  },

  // ── KYC ──────────────────────────────────────────────────
  kycVerified: { type: Boolean, default: false },
  kycDocuments: [{
    type: {
      type: String,
      enum: ['id_card', 'passport', 'utility_bill', 'bank_statement'],
    },
    url:        String,
    uploadedAt: { type: Date, default: Date.now },
    verified:   { type: Boolean, default: false },
  }],

  profileComplete: { type: Boolean, default: false },
  isActive:        { type: Boolean, default: true  },
  lastLogin:       Date,
  notes:           String,

  // ── OTP ──────────────────────────────────────────────────
  otp: { code: String, expiresAt: Date },

  // ── Refresh Tokens ────────────────────────────────────────
  refreshTokens: [{
    token:     String,
    createdAt: { type: Date, default: Date.now },
  }],

}, { timestamps: true });

// ── Indexes (no duplicates) ───────────────────────────────────
userSchema.index({ role: 1 });
userSchema.index({ kycVerified: 1 });

// ── Hash password before save ─────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt    = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ── Instance method: compare password ─────────────────────────
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// ── Strip sensitive fields from JSON output ───────────────────
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.otp;
  delete obj.refreshTokens;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
