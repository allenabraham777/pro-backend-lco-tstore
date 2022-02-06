const cloudinary = require("cloudinary");
const BigPromise = require("../middlewares/bigPromise");
const Product = require("../models/product");
const CustomError = require("../utils/customError");
const WhereClause = require("../utils/whereClause");

module.exports.addProduct = BigPromise(async (req, res) => {
  const photos = [];
  let dbPayload = {};

  if (!req?.files?.photos) {
    throw new CustomError("Product images are required", 400);
  }

  const { name, price, description, category, brand } = req.body;

  if (!(name && price >= 0 && description && category && brand)) {
    throw CustomError("Please provide all product details");
  }

  for (const photo of req.files.photos) {
    const result = await cloudinary.v2.uploader.upload(photo.tempFilePath, {
      folder: "products",
    });

    photos.push({
      id: result.public_id,
      secure_url: result.secure_url,
    });
  }

  dbPayload = {
    name,
    price,
    description,
    category,
    brand,
    photos,
    user: req.user._id,
  };

  const product = await Product.create(dbPayload);

  res.status(200).json({
    success: true,
    product,
  });
});

module.exports.getProducts = BigPromise(async (req, res) => {
  const resultPerPage = 6;
  const totalProductCount = await Product.countDocuments();

  let productsObj = new WhereClause(Product.find(), req.query)
    .search()
    .filter();

  productsObj.pager(resultPerPage);
  const products = await productsObj.base.clone();

  const filteredProductCount = products.length;

  res.status(200).json({
    success: true,
    products,
    filteredProductCount,
    totalProductCount,
  });
});

module.exports.getOneProduct = BigPromise(async (req, res) => {
  const product = await Product.findById(req.params.productId);

  if (!product) {
    throw new CustomError("Product not found", 404);
  }

  res.status(200).json({
    success: true,
    product,
  });
});

module.exports.addReview = BigPromise(async (req, res) => {
  const { productId } = req.params;
  const { rating, comment } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  if (!product) {
    throw new CustomError("Product not found", 404);
  }

  const alreadyReviewed = product.reviews.findIndex(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  let sum = 0,
    total = 0;
  if (alreadyReviewed >= 0) {
    console.log(product);
    console.log(product.reviews[alreadyReviewed]);
    sum =
      product.numberOfReviews * product.ratings -
      product.reviews[alreadyReviewed].rating +
      Number(rating);
    total = product.numberOfReviews;
    product.reviews[alreadyReviewed] = review;
  } else {
    sum = product.numberOfReviews * product.ratings + Number(rating);
    product.reviews.push(review);
    total = product.reviews.length;
    product.numberOfReviews = total;
  }

  console.log(total, sum);
  //Adjust ratings
  product.ratings = total > 0 ? Number(sum / total) : 0;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

module.exports.deleteReview = BigPromise(async (req, res) => {
  const { productId } = req.params;

  const product = await Product.findById(productId);

  if (!product) {
    throw new CustomError("Product not found", 404);
  }

  let review = {
    rating: 0,
  };
  const reviews = product.reviews.filter((rev) => {
    if (rev.user.toString() === req.user._id.toString()) {
      review = rev;
      return false;
    }
    return true;
  });

  product.reviews = reviews;
  const numberOfReviews = product.numberOfReviews - 1;
  const ratings =
    (product.ratings * product.numberOfReviews - review.rating) /
    numberOfReviews;

  await Product.findByIdAndUpdate(
    productId,
    {
      reviews,
      numberOfReviews,
      ratings,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
  });
});

module.exports.getProductReviews = BigPromise(async (req, res) => {
  const { productId } = req.params;

  const product = await Product.findById(productId);
  if (!product) {
    throw new CustomError("Product not found", 400);
  }

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

module.exports.adminGetAllProducts = BigPromise(async (req, res) => {
  const products = await Product.find();

  res.status(200).json({
    success: true,
    products,
  });
});

module.exports.adminUpdateOneProduct = BigPromise(async (req, res) => {
  const photos = [];
  let dbPayload = {};
  let product = await Product.findById(req.params.productId);

  if (!product) {
    throw new CustomError("Product not found", 404);
  }

  const { name, price, description, category, brand } = req.body;

  if (req.files?.photos) {
    for (const photo of product.photos) {
      const res = await cloudinary.v2.uploader.destroy(photo.id);
    }

    for (const photo of req.files.photos) {
      const result = await cloudinary.v2.uploader.upload(photo.tempFilePath, {
        folder: "products",
      });

      photos.push({
        id: result.public_id,
        secure_url: result.secure_url,
      });
    }
    dbPayload.photos = photos;
  }

  dbPayload = {
    ...dbPayload,
    name,
    price,
    description,
    category,
    brand,
  };

  product = await Product.findByIdAndUpdate(req.params.productId, dbPayload, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    product,
  });
});

module.exports.adminDeleteOneProduct = BigPromise(async (req, res) => {
  let product = await Product.findById(req.params.productId);
  if (!product) {
    throw new CustomError("Product not found", 404);
  }

  for (const photo of product.photos) {
    const res = await cloudinary.v2.uploader.destroy(photo.id);
  }

  await product.remove();

  res.status(200).json({
    success: true,
    message: "Product was deleted !",
  });
});
