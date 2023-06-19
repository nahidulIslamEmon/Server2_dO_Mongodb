/**
 * *User Authorize
 */
const ErrorHandler = require('../Utils/errorHandler.js')
const User = require('../Models/userModel.js')
const jwt = require('jsonwebtoken')
exports.authorizeUser = async (req, res, next) => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]
  const expiry = Number(authHeader && authHeader.split(' ')[2])

  const expired = Date.now() > expiry;
  if (expired) return next(new ErrorHandler('JSON Web Token Expired', 401));
  if (!token) return next(new ErrorHandler('Please Login First', 401));
  const decodeData = jwt.verify(token, process.env.JWT_SECRET)
  if (!decodeData) return next(new ErrorHandler('You Messed your jwt token', 404));
  req.user = await User.findById(decodeData.id)
  next()
}

/**
 * *Roles Authorize
 */

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ErrorHandler(`Role ${req.user.role} can't access this resource`, 403));
    }
    next();
  }
}