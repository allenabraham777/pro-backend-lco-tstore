const Order = require("../models/order");
const Product = require("../models/product");

const BigPromise = require("../middlewares/bigPromise");
const CustomError = require("../utils/customError");

module.exports.createOrder = BigPromise(async (req, res) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    taxAmount,
    shippingAmount,
    totalAmount,
  } = req.body;

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    taxAmount,
    shippingAmount,
    totalAmount,
    user: req.user._id,
  });

  res.status(200).json({
    success: true,
    order,
  });
});

module.exports.getOneOrder = BigPromise(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findOne({ _id: orderId, user: req.user._id })
    .populate("user", "name email")
    .populate({
      path: "orderItems",
      populate: { path: "product", select: "name" },
    });

  if (!order) {
    throw new CustomError("Order not found", 404);
  }

  res.status(200).json({
    success: true,
    order,
  });
});

module.exports.getOrdersOfCurrentUser = BigPromise(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });

  res.status(200).json({
    success: true,
    orders,
  });
});

module.exports.adminGetAllOrders = BigPromise(async (req, res) => {
  const orders = await Order.find();

  res.status(200).json({
    success: true,
    orders,
  });
});

module.exports.adminUpdateOrder = BigPromise(async (req, res) => {
  const order = await Order.findById(req.params.orderId);

  if(!order) {
    throw new CustomError("Order not found", 404);
  }

  if (order.orderStatus === "DELIVERED") {
    throw new CustomError("Order already delivered", 400);
  }

  order.orderStatus = req.body.orderStatus;
  
  if (order.orderStatus === "DELIVERED") {
    for(const item of order.orderItems) {
      await updateProductStock(item.product, item.quantity);
    }
  }

  await order.save();

  res.status(200).json({
    success: true,
    order,
  });
});

module.exports.adminDeleteorder = BigPromise(async (req, res)=>{
  const order = await order.findById(req.params.orderId);
  
  if(!order) {
    throw new CustomError("Order not found", 404);
  }
  
  order.remove();
  
  res.status(200).json({
    success: true,
  });
})

async function updateProductStock(productId, quantity) {
  const product = await Product.findById(productId);

  product.stock = product.stock - quantity;

  return await product.save({ validateBeforeSave: false });
}
