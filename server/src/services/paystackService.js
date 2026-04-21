const https = require('https');

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const BASE_URL        = 'api.paystack.co';

// ── Core request helper ───────────────────────────────────────
const paystackRequest = (method, path, body = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      port:     443,
      path,
      method,
      headers: {
        Authorization:  `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          reject(new Error('Invalid JSON response from Paystack'));
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

// ── Initialize a transaction ──────────────────────────────────
// Returns { authorization_url, access_code, reference }
const initializeTransaction = async ({ email, amount, reference, metadata, callbackUrl }) => {
  const body = {
    email,
    amount:       Math.round(amount * 100), // Paystack uses kobo
    reference,
    callback_url: callbackUrl || `${process.env.CLIENT_URL}/payment/verify`,
    metadata:     metadata || {},
    currency:     'NGN',
  };

  const response = await paystackRequest('POST', '/transaction/initialize', body);

  if (!response.status) {
    throw new Error(response.message || 'Failed to initialize Paystack transaction');
  }

  return response.data;
};

// ── Verify a transaction ──────────────────────────────────────
const verifyTransaction = async (reference) => {
  const response = await paystackRequest('GET', `/transaction/verify/${encodeURIComponent(reference)}`);

  if (!response.status) {
    throw new Error(response.message || 'Failed to verify transaction');
  }

  return response.data;
};

// ── List transactions ─────────────────────────────────────────
const listTransactions = async ({ page = 1, perPage = 20, status } = {}) => {
  let path = `/transaction?page=${page}&perPage=${perPage}`;
  if (status) path += `&status=${status}`;

  const response = await paystackRequest('GET', path);
  return response.data || [];
};

// ── Verify webhook signature ──────────────────────────────────
const verifyWebhookSignature = (rawBody, signature) => {
  const crypto = require('crypto');
  const hash   = crypto
    .createHmac('sha512', PAYSTACK_SECRET)
    .update(rawBody)
    .digest('hex');
  return hash === signature;
};

module.exports = {
  initializeTransaction,
  verifyTransaction,
  listTransactions,
  verifyWebhookSignature,
};
