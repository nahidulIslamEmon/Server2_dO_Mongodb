const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const catchAsyncError = require('../Middleware/catchAsyncError.js');

exports.processPayment = catchAsyncError(async (req, res, next) => {
  console.log('here')
  const myPayment = await stripe.paymentIntents.create({
    amount: req.body.amount,
    currency: "usd",
    payment_method_types: ["card"],
    metadata: {
      company: "Elliye LTD",
    }
  })
  res.status(200).json({
    success: true, client_secret: myPayment.client_secret
  }
  )
});

exports.getStripePubKey = catchAsyncError(async (req, res, next) => {
  const key = process.env.STRIPE_PUB_KEY
  res.status(200).json({
    success: true,
    key
  })
})