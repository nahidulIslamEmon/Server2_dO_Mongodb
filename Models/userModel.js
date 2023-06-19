const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')


/**
 * *Creating Schema
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please Enter Your Name'],
    maxLength: [30, 'Name Length Exceeds 30 characters'],
    minLength: [4, 'Name Should have at least 4 characters']

  },
  email: {
    type: String,
    required: [true, 'Please Enter Your Email'],
    unique: true,
    validate: [validator.isEmail, 'Please Enter a Valid Email']
  },
  password: {
    type: String,
    required: [true, 'Please Enter Your Password'],
    minLength: [8, 'Password Should have at least 4 characters'],
    select: false,
  },
  role: {
    type: String,
    default: 'user'
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
})

// avatar: {
//   public_id: {
//     type: String,
//     required: true
//   },
//   url: {
//     type: String,
//     required: true
//   }
// },

/**
 * *Hashing Password When New Password is Entered
 */

userSchema.pre('save', async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10)
})

/**
 * *Generating jwt token
 */
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  })
}

/**
 * *Compare password when login
 */

userSchema.methods.comparePassword = async function (enteredPassword) {
  const isPassTrue = await bcrypt.compare(enteredPassword, this.password)
  return isPassTrue;
}


/**
 * *creating password reset token pa
 */

userSchema.methods.getResetPasswordToken = async function () {
  //generate random bytes
  const resetToken = crypto.randomBytes(16).toString('hex')

  //generate reset password hashed token
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
}


module.exports = mongoose.model('User', userSchema)