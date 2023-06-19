const ErrorHandler = require('../Utils/errorHandler.js')
const catchAsyncError = require('../Middleware/catchAsyncError.js');
const User = require('../Models/userModel.js');
const sendJwtToken = require('../Utils/sendAndSaveJtwToken.js');
const crypto = require('crypto');
const { cloudinary } = require('../Utils/cloudinary-config.js');
const { sendResetPassEmail } = require('../Utils/JetmailEmail.js');

/**
 * *Register User 
 */

exports.registerUser = catchAsyncError(async (req, res, next) => {
  const { name, email, password } = req.body
  // name
  console.log(req.body)
  // const userAvatar = await cloudinary.uploader.upload(req.body.avatar, {
  //   foler: 'MERN-ECOM-AVATARS',
  //   width: 150,
  //   crop: "scale"
  // })
  const user = await User.create({
    name,
    email,
    password,
    // avatar: {
    //   public_id: userAvatar.public_id,
    //   url: userAvatar.secure_url
    // }
  })
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,UPDATE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
  sendJwtToken(user, 201, res)
})

/**
 * *Login User
 */

exports.loginUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body
  if (!email || !password) return next(new ErrorHandler('Please Enter Email and Password', 400));

  const user = await User.findOne({ email }).select('+password')
  const userReturn = await User.findOne({ email })

  if (!user) return next(new ErrorHandler('Invalid Email or Password', 401));

  const isPasswordMatched = await user.comparePassword(password)
  console.log(isPasswordMatched)
  if (!isPasswordMatched) return next(new ErrorHandler('Invalid Email or Password', 401));

  sendJwtToken(userReturn, 200, res)
})

/**
 * !Logout User
 */

exports.logoutUser = catchAsyncError(async (req, res, next) => {
  res.cookie('token', null, {
    expires: new Date(Date.now()),
    httpOnly: true
  })
  res.status(200).json({
    success: true,
    message: 'User logged out'
  })
})

/**
 * !user reset password
 */

exports.forgetPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email })
  if (!user) return next(new ErrorHandler('User Not Found', 404));

  /**
   * *get password reset token
   */
  const resetToken = await user.getResetPasswordToken()
  await user.save({ validateBeforeSave: false })
  const resetPasswordUrl = `${process.env.FRONTEND_SITE_NAME}/password/reset/${resetToken}`
  const message = `Your Password Reset token is : \n\n ${resetPasswordUrl}\n\n please ignore this if you did not make this req`

  try {
    /**
     * *Jetmail Email Sending function => send resetpassword mail
     */
    sendResetPassEmail(req.body.email, message, res)
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false })
    return next(new ErrorHandler(error.message), error, 500)
  }
})

/**
 * !reset password
 */
exports.resetPassword = catchAsyncError(async (req, res, next) => {
  console.log(req.params)
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest('hex')
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  })
  console.log(user)
  if (!user) return next(new ErrorHandler('Invalid Password Reset Token or Token Session Expired', 400))
  if (req.body.password !== req.body.confirmPassword) return next(new ErrorHandler("Password Doesn't Match", 403))

  user.password = req.body.confirmPassword
  user.resetPasswordToken = null;
  user.resetPasswordExpire = null;
  await user.save()
  sendJwtToken(user, 200, res)
})

/**
 * * Change password
 */
exports.changePassword = catchAsyncError(async (req, res, next) => {
  console.log(req.body)
  const user = await User.findById(req.user.id).select("+password")
  console.log(user)
  const isPasswordMatched = await user.comparePassword(req.body.oldPassword)
  console.log(isPasswordMatched)

  if (!isPasswordMatched) return next(new ErrorHandler('You have entered incorrect old password', 400))
  if (req.body.newPassword !== req.body.confirmPassword) return next(new ErrorHandler('Password Did not Matched', 400))

  user.password = req.body.newPassword
  await user.save()

  sendJwtToken(user, 200, res)
})

/**
 * *Visit Profile API
 */
exports.getUserProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id)
  res.status(200).json({
    success: true,
    user
  })
})

/**
 * *update user 
 */

exports.updateUser = catchAsyncError(async (req, res, next) => {

  const newUserData = {
    name: req.body.name || undefined,
    email: req.body.email || undefined,
  }

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  console.log(user);
  res.status(200).json({
    success: true,
    user
  })
})

/**
 * *Get all users (admin)
 */

exports.getAllUsers = catchAsyncError(async (req, res, next) => {
  const users = await User.find({})

  res.status(200).json({
    success: true,
    users
  })
})


/**
 * *Get Single User (admin)
 */
exports.getSingleUser = catchAsyncError(async (req, res, next) => {
  const { id } = req.params
  const user = await User.findById(id)
  console.log(user)
  if (!user) return next(new ErrorHandler('User Does not exist with id ' + id, 400))
  res.status(200).json({
    success: true,
    user
  })
})

/**
 * !Delete Single User
 */
exports.deleteUser = catchAsyncError(async (req, res, next) => {
  const { id } = req.params
  const user = await User.findById(id)
  if (!user) return next(new ErrorHandler('User Does not exist with id ' + id, 400))
  // if (user.role !== 'user') return next(new ErrorHandler('You Cant Delete a Admin', 403))
  user.delete()
  res.status(200).json({
    success: true,
    message: 'User Deleted Successfully'
  })
})

/**
 * *update user roles
 */

exports.updateUserRoles = catchAsyncError(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  }

  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    user
  })
})