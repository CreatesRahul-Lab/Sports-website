const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError.message);
      return res.status(401).json({ 
        message: 'Token is not valid',
        error: 'INVALID_TOKEN',
        clearToken: true 
      });
    }

    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        message: 'User not found',
        error: 'USER_NOT_FOUND',
        clearToken: true 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ 
      message: 'Token is not valid',
      error: 'AUTH_ERROR',
      clearToken: true 
    });
  }
};

const adminMiddleware = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const authorMiddleware = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'author') {
      return res.status(403).json({ message: 'Access denied. Author privileges required.' });
    }
    next();
  } catch (error) {
    console.error('Author middleware error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  authMiddleware,
  adminMiddleware,
  authorMiddleware
};
