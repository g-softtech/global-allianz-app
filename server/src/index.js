require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const connectDB = require('./config/database');
const authRoutes    = require('./routes/auth');
const userRoutes    = require('./routes/users');
const policyRoutes  = require('./routes/policies');
const claimRoutes   = require('./routes/claims');
const paymentRoutes = require('./routes/payments');
const { errorHandler }    = require('./middleware/errorHandler');
const { generalLimiter, sanitizeResponse } = require('./middleware/security');

const app  = express();
const PORT = process.env.PORT || 5003;

connectDB();

// ── Security headers ──────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────
const corsOptions = { credentials: true };
if (process.env.NODE_ENV === 'production') {
  corsOptions.origin = process.env.CLIENT_URL;
} else {
  corsOptions.origin = (origin, cb) => {
    const ok = !origin || ['localhost', '127.0.0.1'].some(h => origin.includes(h));
    cb(null, ok);
  };
}
app.use(cors(corsOptions));

// ── Global rate limit ─────────────────────────────────────────
app.use('/api/', generalLimiter);

// ── Body parsing ──────────────────────────────────────────────
app.use((req, res, next) => {
  if (req.originalUrl === '/api/payments/webhook') {
    let raw = '';
    req.on('data', c => { raw += c.toString(); });
    req.on('end', () => {
      req.rawBody = raw;
      try { req.body = JSON.parse(raw); } catch { req.body = {}; }
      next();
    });
  } else {
    express.json({ limit: '10mb' })(req, res, next);
  }
});
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Strip sensitive fields from all responses ─────────────────
app.use(sanitizeResponse);

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ── API routes ────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/claims',   claimRoutes);
app.use('/api/payments', paymentRoutes);

// ── 404 handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Error handler ─────────────────────────────────────────────
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
  console.log(`🔒 Security middleware active`);
});

module.exports = app;
