const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      console.log('protect: NO TOKEN');
      return res.status(401).json({ success: false, message: 'Not authorized — no token' });
    }

    console.log('protect: token found, verifying...');

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('protect: token valid, userId:', decoded.userId);
    } catch (err) {
      console.log('protect: token invalid —', err.message);
      return res.status(401).json({ success: false, message: 'Not authorized — invalid token' });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      console.log('protect: user not found');
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    if (!user.isActive) {
      console.log('protect: user deactivated');
      return res.status(401).json({ success: false, message: 'Account is deactivated' });
    }

    console.log('protect: OK — user:', user.email);
    req.user = user;
    next();

  } catch (error) {
    console.error('protect: unexpected error —', error.message);
    res.status(500).json({ success: false, message: 'Server error in auth middleware' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized`,
      });
    }
    next();
  };
};

const ownerOrAdmin = (req, res, next) => {
  if (req.user.role === 'admin' || req.user._id.toString() === req.params.id) {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
};

module.exports = { protect, authorize, ownerOrAdmin };
