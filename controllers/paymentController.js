const BigPromise = require("../middlewares/bigPromise");
const CustomError = require("../utils/customError");
const Razorpay = require("razorpay");

const stripe = require("stripe")(process.env.STRIPE_SECRET);
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
});

module.exports.sendStripeKey = BigPromise(async (req, res) => {
  res.status(200).json({
    stripeKey: process.env.STRIPE_API_KEY,
  });
});

module.exports.captureStripePayment = BigPromise(async (req, res) => {
  const { amount } = req.body;

  if (amount < 0) {
    throw new CustomError("Please provide a valid amount", 400);
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "INR",
    automatic_payment_methods: { enabled: true },
    metadata: {
      integration_check: "accept_a_payment",
    },
  });

  res.status(200).json({
    success: true,
    client_secret: paymentIntent.client_secret,
  });
});

module.exports.sendRazorpayKey = BigPromise(async (req, res) => {
  res.status(200).json({
    stripeKey: process.env.RAZORPAY_API_KEY,
  });
});

module.exports.captureRazorpayPayment = BigPromise(async (req, res) => {
  const { amount } = req.body;

  if (amount < 0) {
    throw new CustomError("Please provide a valid amount", 400);
  }

  const order = await razorpay.orders.create({
    amount,
    currency: "INR"
  });

  res.status(200).json({
    success: true,
    amount,
    order
  });
});
