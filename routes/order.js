const router = require("express").Router();
const {
  createOrder,
  getOneOrder,
  getOrdersOfCurrentUser,
  adminGetAllOrders,
  adminUpdateOrder,
  adminDeleteorder,
} = require("../controllers/orderController");
const { isLoggedIn, customRole } = require("../middlewares/user");

router
  .route("/orders")
  .post(isLoggedIn, createOrder)
  .get(isLoggedIn, getOrdersOfCurrentUser);

router.route("/orders/:orderId").get(isLoggedIn, getOneOrder);

router
  .route("/admin/orders")
  .get(isLoggedIn, customRole("admin"), adminGetAllOrders);
router
  .route("/admin/orders/:orderId")
  .put(isLoggedIn, customRole("admin"), adminUpdateOrder)
  .delete(isLoggedIn, customRole("admin"), adminDeleteorder);

module.exports = router;
