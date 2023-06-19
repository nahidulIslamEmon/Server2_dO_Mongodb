const express = require('express');
const { addKitchen, getAllKitchen } = require('../Controllers/kitchenController.js');
const { getAllproducts, createProduct, updateProduct, deleteProduct, allAdminProduct, getSingleProduct, addRating, getAllReviews, deleteReview, getProductWithKitchenName } = require('../Controllers/productcontroller.js');
const { authorizeUser, authorizeRoles } = require('../Middleware/authorizeUser.js');
const router = express.Router();

router.route('/products').get(getAllproducts);
router.route('/admin/product/new').post(authorizeUser, authorizeRoles('admin'), createProduct);
router.route('/admin/allProducts').get(allAdminProduct);
router.route('/admin/product/:id')
  .delete(authorizeUser, authorizeRoles('admin'), deleteProduct)
  .put(authorizeUser, authorizeRoles('admin'), updateProduct);

router.route('/product/:id').get(getSingleProduct)
router.route('/product/kitchen/:id').get(getProductWithKitchenName)
router.route('/review').put(authorizeUser, addRating)
router.route('/reviews').get(getAllReviews).delete(authorizeUser, deleteReview)
router.route('/kitchen/add').post(authorizeUser, authorizeRoles('admin'), addKitchen)
router.route('/kitchens').get(getAllKitchen)


module.exports = router;
