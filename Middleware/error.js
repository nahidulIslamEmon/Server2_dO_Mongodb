const ErrorHandler = require('../Utils/errorHandler.js')
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  /**
   * !wrong mongodb id error
   */
  if (err.name === "CastError") {
    const message = `Resource not found invalid ${err.path}`
    err = new ErrorHandler(message, 400)
  }

  // Duplicate error mongodb
  if (err.code === 11000) {
    const message = `duplicate ${Object.keys(err.keyValue)} entered`
    err = new ErrorHandler(message, 400)
  }

  //Json web token error
  if (err.name === 'JsonWebTokenError') {
    const message = `Invalid JWT Token Found`
    err = new ErrorHandler(message, 400)
  }
  if (err.name === 'invalid signature') {
    const message = `Invalid Signature Found`
    err = new ErrorHandler(message, 400)
  }
  //JWT expire error
  if (err.name === 'TokenExpireError') {
    const message = ` JWT Token Expired`
    err = new ErrorHandler(message, 400)
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};
