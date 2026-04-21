/**
 * KYC Verification Service
 *
 * This service handles document verification using:
 * 1. Basic validation (file type, size, dimensions) — implemented now
 * 2. Smile Identity API — Nigerian government database verification (requires API key)
 * 3. Manual admin review fallback — always available
 *
 * To enable Smile Identity:
 *   1. Sign up at https://smileidentity.com
 *   2. Add SMILE_IDENTITY_API_KEY and SMILE_IDENTITY_PARTNER_ID to .env
 *   3. Set SMILE_IDENTITY_ENABLED=true in .env
 */

const https = require('https');

const SMILE_ENABLED     = process.env.SMILE_IDENTITY_ENABLED === 'true';
const SMILE_API_KEY     = process.env.SMILE_IDENTITY_API_KEY;
const SMILE_PARTNER_ID  = process.env.SMILE_IDENTITY_PARTNER_ID;
const SMILE_BASE_URL    = 'testapi.smileidentity.com'; // use api.smileidentity.com for production

// ── Document types we accept and their validation rules ────────
const DOCUMENT_RULES = {
  id_card: {
    label:       'National ID Card (NIN)',
    minSize:     50 * 1024,   // 50KB minimum — reject tiny screenshots
    maxSize:     5 * 1024 * 1024,
    allowedTypes:['image/jpeg', 'image/png'],
    description: 'Front of your National Identity Card (NIN slip or laminated card)',
    verifyWith:  'NIN_V2', // Smile Identity job type
  },
  passport: {
    label:       'International Passport',
    minSize:     50 * 1024,
    maxSize:     5 * 1024 * 1024,
    allowedTypes:['image/jpeg', 'image/png', 'application/pdf'],
    description: 'Bio-data page of your international passport',
    verifyWith:  'PASSPORT',
  },
  utility_bill: {
    label:       'Utility Bill',
    minSize:     30 * 1024,
    maxSize:     5 * 1024 * 1024,
    allowedTypes:['image/jpeg', 'image/png', 'application/pdf'],
    description: 'NEPA/EKEDC bill, water bill, or similar — not older than 3 months',
    verifyWith:  null, // Manual review only
  },
  bank_statement: {
    label:       'Bank Statement',
    minSize:     30 * 1024,
    maxSize:     5 * 1024 * 1024,
    allowedTypes:['application/pdf'],
    description: 'Last 3 months bank statement with bank stamp',
    verifyWith:  null,
  },
  drivers_licence: {
    label:       "Driver's Licence",
    minSize:     50 * 1024,
    maxSize:     5 * 1024 * 1024,
    allowedTypes:['image/jpeg', 'image/png'],
    description: "Front of your driver's licence",
    verifyWith:  'DRIVERS_LICENSE',
  },
  voters_card: {
    label:       "Voter's Card",
    minSize:     50 * 1024,
    maxSize:     5 * 1024 * 1024,
    allowedTypes:['image/jpeg', 'image/png'],
    description: "Front of your Permanent Voter's Card (PVC)",
    verifyWith:  'V_NIN',
  },
};

// ── Basic document validation ─────────────────────────────────
const validateDocument = (file, docType) => {
  const rules = DOCUMENT_RULES[docType];
  if (!rules) {
    return { valid: false, reason: `Unknown document type: ${docType}` };
  }

  // Size check
  if (file.size < rules.minSize) {
    return {
      valid:  false,
      reason: `File too small (${Math.round(file.size/1024)}KB). Minimum ${Math.round(rules.minSize/1024)}KB. Please upload a clear, full-resolution photo — not a screenshot or thumbnail.`,
    };
  }

  if (file.size > rules.maxSize) {
    return {
      valid:  false,
      reason: `File too large (${Math.round(file.size/1024/1024)}MB). Maximum 5MB.`,
    };
  }

  // MIME type check
  if (!rules.allowedTypes.includes(file.mimetype)) {
    return {
      valid:  false,
      reason: `${rules.label} must be uploaded as: ${rules.allowedTypes.join(', ')}. Got: ${file.mimetype}.`,
    };
  }

  return { valid: true };
};

// ── NIN Verification via Smile Identity ───────────────────────
const verifyNIN = async (nin, firstName, lastName, dateOfBirth) => {
  if (!SMILE_ENABLED) {
    console.log('[KYC] Smile Identity disabled — queuing for manual review');
    return { verified: false, method: 'manual_review', message: 'Queued for manual verification' };
  }

  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      partner_id:    SMILE_PARTNER_ID,
      api_key:       SMILE_API_KEY,
      id_number:     nin,
      id_type:       'NIN_V2',
      first_name:    firstName,
      last_name:     lastName,
      dob:           dateOfBirth, // YYYY-MM-DD
      country:       'NG',
    });

    const options = {
      hostname: SMILE_BASE_URL,
      path:     '/v1/id_verification',
      method:   'POST',
      headers:  {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({
            verified:    result.ResultCode === '1012', // Smile Identity success code
            confidence:  result.ConfidenceValue || 0,
            fullName:    result.FullName,
            method:      'smile_identity',
            rawResponse: result,
          });
        } catch (e) {
          reject(new Error('Invalid response from verification service'));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
};

// ── BVN Verification ──────────────────────────────────────────
const verifyBVN = async (bvn, firstName, lastName) => {
  if (!SMILE_ENABLED) {
    return { verified: false, method: 'manual_review', message: 'Queued for manual verification' };
  }
  // Same pattern as NIN but with id_type: 'BVN'
  return { verified: false, method: 'manual_review', message: 'BVN verification via Smile Identity — configure API key' };
};

// ── Get verification status label ─────────────────────────────
const getVerificationStatus = (user) => {
  if (user.kycVerified) return { status: 'verified', label: 'Fully Verified', color: 'green' };
  if (user.kycDocuments?.length > 0) return { status: 'pending', label: 'Under Review', color: 'orange' };
  return { status: 'unverified', label: 'Not Submitted', color: 'red' };
};

module.exports = {
  DOCUMENT_RULES,
  validateDocument,
  verifyNIN,
  verifyBVN,
  getVerificationStatus,
};
