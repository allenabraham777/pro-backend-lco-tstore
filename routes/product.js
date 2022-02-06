const router = require("express").Router();
const { isLoggedIn, customRole } = require("../middlewares/user");

const {
  addProduct,
  getProducts,
  adminGetAllProducts,
  getOneProduct,
  adminUpdateOneProduct,
  adminDeleteOneProduct,
  addReview,
  getProductReviews,
  deleteReview,
} = require("../controllers/productController");

//User Routes
router.route("/products").get(isLoggedIn, getProducts);
router.route("/products/:productId").get(isLoggedIn, getOneProduct);

//Admin Routes
router
  .route("/admin/product/add")
  .post(isLoggedIn, customRole("admin"), addProduct);

router
  .route("/admin/products")
  .get(isLoggedIn, customRole("admin"), adminGetAllProducts);

router
  .route("/admin/products/:productId")
  .put(isLoggedIn, customRole("admin"), adminUpdateOneProduct)
  .delete(isLoggedIn, customRole("admin"), adminDeleteOneProduct);

router
  .route("/products/:productId/reviews")
  .get(isLoggedIn, getProductReviews)
  .put(isLoggedIn, addReview)
  .delete(isLoggedIn, deleteReview);

module.exports = router;
