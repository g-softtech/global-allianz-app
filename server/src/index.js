require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const policyRoutes = require('./routes/policies');
const claimRoutes = require('./routes/claims');
const paymentRoutes = require('./routes/payments');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5003;

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// CORS configuration - allow all localhost ports in development
const corsOptions = {
  credentials: true
};

if (process.env.NODE_ENV === 'production') {
  corsOptions.origin = process.env.CLIENT_URL;
} else {
  // In development, allow all localhost origins
  corsOptions.origin = function (origin, callback) {
    const allowedHosts = ['localhost', '127.0.0.1'];
    const isAllowed = !origin || allowedHosts.some(host => origin.includes(host));
    callback(null, isAllowed);
  };
}

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/payments', paymentRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
});

module.exports = app;