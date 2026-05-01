const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String, required: [true, 'Email is required'],
    unique: true, lowercase: true, trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String, required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false,
  },
  firstName:  { type: String, required: true, trim: true },
  lastName:   { type: String, required: true, trim: true },
  phone:      { type: String, required: true },
  role:       { type: String, enum: ['customer', 'admin', 'agent'], default: 'customer' },
  kycVerified:{ type: Boolean, default: false },
  kycVerifiedAt: { type: Date, default: null },
  kycDocuments: [{
    type:       { type: String, enum: ['id_card','passport','utility_bill','bank_statement','drivers_licence','voters_card'] },
    url:        String,
    fileName:   String,
    fileSize:   Number,
    mimeType:   String,
    uploadedAt: { type: Date, default: Date.now },
    verified:   { type: Boolean, default: false }
  }],
  nin:              { type: String, default: null },
  profileComplete:  { type: Boolean, default: false },
  address: {
    street: String, city: String, state: String,
    zipCode: String, country: { type: String, default: 'Nigeria' }
  },
  dateOfBirth: Date,
  occupation:  String,
  otp: { code: String, expiresAt: Date },
  isActive:       { type: Boolean, default: true },
  loginAttempts:  { type: Number,  default: 0 },
  lockUntil:      { type: Date,    default: null },
  lastLogin:      Date,
  refreshTokens:  [{ token: String, createdAt: { type: Date, default: Date.now } }],
  // Password reset
  passwordResetToken:   { type: String, default: null },
  passwordResetExpires: { type: Date,   default: null },
}, { timestamps: true });

userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) { next(error); }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.otp;
  delete obj.refreshTokens;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
