// import catchAsyncError from "../Middleware/catchAsyncError.js";
const catchAsyncError = require("../Middleware/catchAsyncError.js");
const Kitchen = require('../Models/kitchenModel.js');
const { cloudinary } = require("../Utils/cloudinary-config.js");
// import Kitchen from "../Models/kitchenModel.js";

exports.addKitchen = catchAsyncError(async (req, res, next) => {

  const { name, images } = req.body;
  const uploadedImage = await cloudinary.uploader.upload(images, {
    folder: 'kitchen',
    crop: "scale",
    height: 400,
    width: 600,
  })

  console.log(uploadedImage.secure_url)

  const kitchen = await Kitchen.create({
    name,
    image: uploadedImage.secure_url,
  });
  console.log(kitchen)

  res.status(201).json({
    success: true,
    kitchen
  });
})

exports.getAllKitchen = catchAsyncError(async (req, res, next) => {
  const kitchens = await Kitchen.find();
  res.status(201).json({
    success: true,
    kitchens
  });
})

