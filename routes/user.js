const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getLoggedInUserDetail,
  changePassword,
  updateUserDetails,
  adminAllUser,
  managerAllUser,
  adminSingleUser,
  singleUser,
  updateOneUserDetailsByAdmin,
  deleteOneUserByAdmin,
  authState,
} = require("../controller/userController");
const { isLoggedIn, customRole } = require("../middleware/user");

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/authstate").get(isLoggedIn, authState);
router.route("/logout").get(logout);
router.route("/forgotPassword").post(forgotPassword);
router.route("/password/reset/:token").post(resetPassword);
router.route("/userdashboard").get(isLoggedIn, getLoggedInUserDetail);
router.route("/password/update").post(isLoggedIn, changePassword);
router.route("/userdashboard/update").post(isLoggedIn, updateUserDetails);

// admin only route
router.route("/admin/users").get(isLoggedIn, customRole("admin"), adminAllUser);
router
  .route("/admin/users/:id")
  .get(isLoggedIn, customRole("admin"), singleUser)
  .put(isLoggedIn, customRole("admin"), updateOneUserDetailsByAdmin)
  .delete(isLoggedIn, customRole("admin"), deleteOneUserByAdmin); // need testing

// manager only route
router
  .route("/manager/users")
  .get(isLoggedIn, customRole("manager"), managerAllUser);
router
  .route("/manager/users/:id")
  .get(isLoggedIn, customRole("manager"), singleUser);

module.exports = router;
