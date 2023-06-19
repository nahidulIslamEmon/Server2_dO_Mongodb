const { consumers } = require('nodemailer/lib/xoauth2');
const catchAsyncError = require('../Middleware/catchAsyncError.js')
const Order = require('../Models/orderModel.js');
const Product = require('../Models/productmodel.js');
const Coupon = require('../Models/couponModel.js');
const ErrorHandler = require('../Utils/errorHandler.js');

/**
 * *Place order api
 */
exports.placeOrder = catchAsyncError(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    priceBreakdown,
  } = req.body;
  console.log(req.body)

  const order = await Order.create({
    shippingInfo,
    orderItems,

    paymentInfo,
    priceBreakdown,
    user: req.user._id,
    paidAt: Date.now(),
  })

  res.status(201).json({
    success: true,
    order
  })
})

/**
 * *Get Single Order Status
 */
exports.getSingleOrder = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate("user", "name email")
  if (!order) return next(new ErrorHandler('Order not found', 404))

  res.status(200)
    .json({
      success: true,
      order
    })
})

/**
 * *Get My All Orders
 */

exports.myOrders = catchAsyncError(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id })
  res.status(200).json({
    success: true,
    orders
  })
})

/**
 * ?Admin Router 
 * *Get All Orders
 */
exports.getAllOrders = catchAsyncError(async (req, res, next) => {
  const orders = await Order.find()
  let orderValue = 0;
  orders.forEach((order) => orderValue += order.priceBreakdown.totalPrice)

  const orderReversed = orders.reverse()

  res.status(200).json({
    success: true,
    orders: orderReversed,
    orderValue
  })
})

/**
 * ?Admin routes 
 * *update order
 */
exports.updateOrder = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id)

  if (!order) return next(new ErrorHandler('Order not found', 404))
  console.log(order)

  if (order.orderStatus === 'Delivered') return next(new ErrorHandler('Order already delivered'))

  order.orderStatus = req.body.status;
  if (req.body.status === 'Delivered') order.deliveredAt = Date.now()
  if (order.orderStatus === 'Shipped') order.shippedAt = Date.now()


  const updateStock = async (id, quantity) => {
    console.log(id, quantity, 'contril')
    const product = await Product.findById(id)
    product.stock -= quantity;
    await product.save({ validateBeforeSave: false });
  }
  if (req.body.status === 'Shipped' || 'Delivered') {
    console.log(order)
    order.orderItems.forEach(async item => {

      await updateStock(item._id, item.quantity)
    })
    console.log(order)
  }


  await order.save({ validateBeforeSave: false })
  res.status(200).json({
    success: true,
    order
  })
})

/**
 * ! Delete Order 
 */
exports.deleteOrder = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
  if (!order) return next(new ErrorHandler('Order not found', 404))
  await order.remove()

  res.status(200).json({
    success: true,
    message: 'Order Delete Successful'
  })

})


exports.createCoupon = catchAsyncError(async (req, res, next) => {
  const { code, discount } = req.body;
  const coupon = await Coupon.create({
    code,
    discount
  })
  res.status(201).json({
    success: true,
    coupon
  })
})
exports.getAllCoupon = catchAsyncError(async (req, res, next) => {

  const coupons = await Coupon.find()
  res.status(201).json({
    success: true,
    coupons
  })
})


exports.validateCoupon = catchAsyncError(async (req, res, next) => {
  console.log(req.body)


  const coupon = await Coupon.findOne({ code: req.body.coupon.toUpperCase(), $options: 'i' })
  if (!coupon) return next(new ErrorHandler('Coupon not valid', 404))
  res.status(200).json({
    success: true,
    coupon,
    message: 'Coupon Added Successfully',
  })
})


exports.deleteCoupon = catchAsyncError(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id)
  if (!coupon) return next(new ErrorHandler('Coupon not found', 404))
  await coupon.remove()

  res.status(200).json({
    success: true,
    message: 'Coupon Delete Successful'
  })
})