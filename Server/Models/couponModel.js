const mongoose = require('mongoose');

const couponSchema = mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  discount: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model('coupon', couponSchema);