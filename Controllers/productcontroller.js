const Product = require('../Models/productmodel.js')
const ErrorHandler = require('../Utils/errorHandler.js')
const catchAsyncError = require('../Middleware/catchAsyncError.js');
const ApiFeature = require('../Utils/apiFeature.js');
const { cloudinary } = require('../Utils/cloudinary-config.js');

/**
 * *Creating Product
 * ?Only Admin Access
 */
exports.createProduct = catchAsyncError(async (req, res, next) => {

  let images = []
  let imagelinks = []

  if (typeof req.body.images === 'string') {
    images.push(req.body.images)
  } else {
    images = req.body.images
  }

  //upload image to cloudinary
  if (images.length > 0) {
    for (let i = 0; i < images.length; i++) {
      const newImage = await cloudinary.uploader.upload(images[i], {
        folder: 'products',
        crop: "scale",
        height: 500,
        width: 500,
      })
      console.log(newImage)
      imagelinks.push({
        public_id: newImage.public_id,
        url: newImage.secure_url
      })
    }
  }
  req.body.images = imagelinks
  console.log(req.body)

  req.body.user = await req.user.id;
  const product = await Product.create(req.body)
  if (!product) return next(new ErrorHandler('Couldnt create product', 409))
  res.status(201).json({
    success: true,
    product
  })
});

/**
 * all admin product
 */
exports.allAdminProduct = catchAsyncError(async (req, res, next) => {
  const products = await Product.find({})
  res.status(200).json({
    success: true,
    products
  })
})

/**
 * *Get Reading/Getting Product
 * 
 */
exports.getAllproducts = catchAsyncError(async (req, res) => {
  const resultPerPage = 8;
  const productsCount = await Product.countDocuments();
  const searchProducts = new ApiFeature(Product.find(), req.query)
    .search()
    .filter()
    .pagination(resultPerPage)
  const products = await searchProducts.query

  res.status(200).json({

    success: true,
    products,
    productsCount,
    resultPerPage,
  })
})

/**
 * *update product 
 * ?Only Admin Access
 */
exports.updateProduct = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  let product = await Product.findById(id)
  if (!product) return next(new ErrorHandler('Product Not Found', 404));

  //images start from here
  let images = [];
  if (typeof req.body.images === 'string') {
    images.push(req.body.images)
  } else {
    images = req.body.images
  }

  let imageLinks = []

  if (images !== undefined) {
    for (let i = 0; i < images.length; i++) {
      const newImage = await cloudinary.uploader.upload(images[i], {
        folder: 'products',
      })
      imageLinks.push({
        public_id: newImage.public_id,
        url: newImage.secure_url
      })
    }
    req.body.images = imageLinks;
  }

  console.log(req.body)

  product = await Product.findByIdAndUpdate(id, req.body, {
    new: true, runValidators: true, useFindAndModify: false
  })
  res.status(200).json({
    success: true,
    product
  })
})

/**
 * *Delete Product from the Database
 */

exports.deleteProduct = catchAsyncError(async (req, res, next) => {
  const { id } = req.params
  const product = await Product.findById(id)
  if (!product) return next(new ErrorHandler('Product not found', 404))

  const images = product.images
  for (let i = 0; i < images.length; i++) {
    await cloudinary.uploader.destroy(images[i].public_id)
  }

  product.remove()
  res.status(200).json({
    success: true,
    message: 'Product deleted successfully'
  })

})

/**
 * *Get a single product by id
 */

exports.getSingleProduct = catchAsyncError(async (req, res, next) => {
  const { id } = req.params
  const product = await Product.findById(id)
  if (!product) return next(new ErrorHandler('Product not found', 404))
  res.status(200).json({
    success: true,
    product
  })
})

/**
 * *add rating
 */

exports.addRating = catchAsyncError(async (req, res, next) => {
  const { rating, comment, productId } = req.body
  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  }

  const product = await Product.findById(productId)
  const isReviewed = await product.reviews.find(review => review.user.toString() === req.user._id.toString())
  console.log('isReviewed', isReviewed)

  if (isReviewed) {
    product.reviews.forEach(rev => {
      if (rev.user.toString() === req.user._id.toString()) {
        rev.rating = rating
        rev.comment = comment
      }
    });
  }
  else {
    await product.reviews.push(review)
    product.numOfReviews = product.reviews.length
  }
  let avg = 0;
  await product.reviews.forEach(rev => avg = avg + rev.rating);
  product.ratings = Number(avg / product.reviews.length)
  await product.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true
  })

})

/**
 * *Get All Product Reviews
 */

exports.getAllReviews = catchAsyncError(async (req, res, next) => {

  const product = await Product.findById(req.query.productId)
  if (!product) return next(new ErrorHandler('Product Not Found', 404));

  res.status(200).json({
    success: true,
    reviews: product.reviews
  })
})

/**
 * *Delete Review
 */
exports.deleteReview = catchAsyncError(async (req, res, next) => {

  const product = await Product.findById(req.query.productId)
  if (!product) return next(new ErrorHandler('Product Not Found', 404));

  const reviews = await product.reviews.filter(review => review._id.toString() !== req.query.id.toString());
  console.log(reviews)
  product.reviews = reviews;
  product.numOfReviews = product.reviews.length

  let avg = 0;
  reviews.forEach(rev => avg = avg + rev.rating)
  let ratings = Number(avg / reviews.length)
  if (reviews.length === 0) {
    ratings = 0
  }
  product.ratings = ratings
  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  })
})


exports.getDBAllProductAdmin = catchAsyncError(async (req, res, next) => {
  const DBallProducts = await Product.find({})
  res.status(200).json({
    success: true,
    products: DBallProducts
  })
})


exports.getProductWithKitchenName = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const products = await Product.find({ kitchen: id }).populate('kitchen')

  res.status(200).json({
    success: true,
    products
  })
})
