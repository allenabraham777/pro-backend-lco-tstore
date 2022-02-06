const router = require("express").Router();

const {
  signup,
  login,
  logout,
  forgotPassword,
  passwordReset,
  getLoggedInUserDetails,
  changePassword,
  updateProfile,
  adminAllUsers,
  managerAllUsers,
  adminGetOneUser,
  adminUpdateOneUser,
  adminDeleteOneUser,
} = require("../controllers/userController");
const { isLoggedIn, customRole } = require("../middlewares/user");

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgotPassword").get(forgotPassword);
router.route("/password/reset/:token").post(passwordReset);
router.route("/user/password").put(isLoggedIn, changePassword);
router
  .route("/user/dashboard")
  .get(isLoggedIn, getLoggedInUserDetails)
  .put(isLoggedIn, updateProfile);

//Admin only routes
router
  .route("/admin/users")
  .get(isLoggedIn, customRole("admin"), adminAllUsers);
router
  .route("/admin/users/:userId")
  .get(isLoggedIn, customRole("admin"), adminGetOneUser)
  .put(isLoggedIn, customRole("admin"), adminUpdateOneUser)
  .delete(isLoggedIn, customRole("admin"), adminDeleteOneUser);

//Manager only routes
router
  .route("/manager/users")
  .get(isLoggedIn, customRole("manager", "admin"), managerAllUsers);

module.exports = router;
