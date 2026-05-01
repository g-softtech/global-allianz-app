// ADD THESE FIELDS to your User model schema (server/src/models/User.js)
// Place them with the other fields

passwordResetToken:   { type: String,  default: null },
passwordResetExpires: { type: Date,    default: null },
kycVerifiedAt:        { type: Date,    default: null },
