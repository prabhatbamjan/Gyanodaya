const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/userModels');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * Middleware to protect routes requiring authentication
 */
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Get token from cookies
  let token;
  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please log in to get access.', 401));
  }

  // 2) Verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
}); 