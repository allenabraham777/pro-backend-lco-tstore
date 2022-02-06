const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide product name"],
    trim: true,
    maxlength: [120, "Product name should be not more than 120 charactres"],
  },
  price: {
    type: Number,
    required: [true, "Please provide product price"],
    maxlength: [5, "Product price should be not more than 5 digits"],
  },
  description: {
    type: String,
    required: [true, "Please provide product description"],
    trim: true,
  },
  photos: [
    {
      id: {
        type: String,
        required: true,
      },
      secure_url: {
        type: String,
        required: true,
      },
    },
  ],
  category: {
    type: String,
    required: [
      true,
      "Please provide product category (SHORT_SLEEVES, LONG_SLEEVES, SWEAT_SHIRTS, HOODIES)",
    ],
    enum: {
      values: ["SHORT_SLEEVES", "LONG_SLEEVES", "SWEAT_SHIRTS", "HOODIES"],
      message:
        "Please provide product category only from: SHORT_SLEEVES, LONG_SLEEVES, SWEAT_SHIRTS and HOODIES",
    },
    trim: true,
  },
  stock: {
    type: Number,
    required: [true, "Please add total stock"]
  },
  brand: {
    type: String,
    required: true,
  },
  ratings: {
    type: Number,
    default: 0,
  },
  numberOfReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
    },
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
