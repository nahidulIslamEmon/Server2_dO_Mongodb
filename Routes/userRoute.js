const express = require('express')
const { registerUser, loginUser, logoutUser, forgetPassword, resetPassword, getUserProfile, changePassword, updateUser, deleteUser, getAllUsers, getSingleUser, updateUserRoles } = require('../Controllers/userControler.js')
const { authorizeUser, authorizeRoles } = require('../Middleware/authorizeUser.js')
const router = express.Router()

router.route('/register').post(registerUser)
router.route('/login').post(loginUser)
router.route('/forget-password').post(forgetPassword)
router.route('/change-password').put(authorizeUser, changePassword)
router.route('/reset-password/:token').put(resetPassword)
router.route('/logout').get(logoutUser)

//user authorised route
router.route('/me').get(authorizeUser, getUserProfile)
router.route('/update-userprofile').put(authorizeUser, updateUser)

//admin routes
router.route('/admin/all-users').get(authorizeUser, authorizeRoles('admin'), getAllUsers)
router.route('/admin/user/:id').get(authorizeUser, authorizeRoles('admin'), getSingleUser)
router.route('/admin/delete/user/:id').delete(authorizeUser, authorizeRoles('admin'), deleteUser)
router.route('/admin/user/edit-role/:id').put(authorizeUser, authorizeRoles('admin'), updateUserRoles)


module.exports = router;