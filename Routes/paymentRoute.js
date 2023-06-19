const express = require('express');
const { processPayment, getStripePubKey } = require('../Controllers/paymentController.js');
const { authorizeUser } = require('../Middleware/authorizeUser.js')
const router = express.Router()

router.route('/payment/process').post(authorizeUser, processPayment)
router.route('/getStipePubKey').get(getStripePubKey)

module.exports = router;