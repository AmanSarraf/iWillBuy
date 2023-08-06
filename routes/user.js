const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  logout,
  forgotPassword,
  passwordReset,
  getLoggedinUserDetails,
  changePassword,
  updateUserDetail,
  adminAllUsers,
  managerAllUsers,
  adminGetOneUser,
  adminUpdateOneUser,
  adminDeleteOneUser,
} = require("../controller/userController");

const { isLoggedIn, customRole } = require("../middleware/user");

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgotpassword").post(forgotPassword);
router.route("/password/reset/:token").post(passwordReset);
router.route("/userdashboard").get(isLoggedIn, getLoggedinUserDetails);
router.route("/password/update").post(isLoggedIn, changePassword);
router.route("/userdashboard/update").post(isLoggedIn, updateUserDetail);

//for admin
router
  .route("/admin/users")
  .get(isLoggedIn, customRole("admin"), adminAllUsers);
router
  .route("/admin/user/:id")
  .get(isLoggedIn, customRole("admin"), adminGetOneUser);

router
  .route("/admin/user/:id")
  .put(isLoggedIn, customRole("admin"), adminUpdateOneUser);

router
  .route("/admin/user/:id")
  .delete(isLoggedIn, customRole("admin"), adminDeleteOneUser);

router
  .route("/manager/users")
  .get(isLoggedIn, customRole("manager"), managerAllUsers);

module.exports = router;
