const express = require('express');
const { placeOrder, getSingleOrder, myOrders, getAllOrders, updateOrder, deleteOrder, createCoupon, getAllCoupon, validateCoupon, deleteCoupon } = require('../Controllers/orderController.js');
const { authorizeUser, authorizeRoles } = require('../Middleware/authorizeUser.js');
const router = express.Router()

router.route('/order/new').post(authorizeUser, placeOrder)
router.route('/order/:id').get(authorizeUser, getSingleOrder)
router.route('/my-orders').get(authorizeUser, myOrders)
router.route('/coupon/add').post(authorizeUser, authorizeRoles('admin'), createCoupon)
router.route('/coupons').get(authorizeUser, authorizeRoles('admin'), getAllCoupon)
router.route('/validate-coupon').post(validateCoupon)
router.route('/coupon/:id').delete(authorizeUser, authorizeRoles('admin'), deleteCoupon)

//--> Admin <--//
router.route('/admin/orders').get(getAllOrders)
router.route('/admin/order/:id')
  .put(authorizeUser, authorizeRoles('admin'), updateOrder)
  .delete(authorizeUser, authorizeRoles('admin'), deleteOrder)

module.exports = router;