const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  activateEmail,
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
  follow,
  unfollow,
  userImagines,
  getUserDetail,
  mySavedImagines,
  getMyDetail,
  allFollowers,
  getUserFollowerFollowings,
  getUserflw,
  getAccountDetail,
  getAccessToken,
  googleLogin,
} = require("../controller/userController");
const { isLoggedIn, customRole } = require("../middleware/user");

router.route("/signup").post(signup);
router.route("/activation").post(activateEmail);
router.route("/login").post(login);
router.route("/google_login").post(googleLogin);
router.route("/refresh_token").post(getAccessToken);

router.route("/authstate").get(isLoggedIn, authState); // todo : remove endpoint

router.route("/logout").get(logout);
router.route("/forgotPassword").post(forgotPassword);
router.route("/reset").post(isLoggedIn, resetPassword);

router.route("/userdashboard").get(isLoggedIn, getLoggedInUserDetail);
router.route("/ac/:id").get(getAccountDetail);
router.route("/ac/imagines/:id").get(userImagines);
router.route("/mydetails").get(isLoggedIn, getMyDetail);
router.route("/userdashboard/:id").get(isLoggedIn, getUserDetail);
router.route("/password/update").post(isLoggedIn, changePassword);
router.route("/userdashboard/update").patch(isLoggedIn, updateUserDetails);
router.route("/follow").put(isLoggedIn, follow);
router.route("/unfollow").put(isLoggedIn, unfollow);
router.route("/userimagines/:id").get(isLoggedIn, userImagines);
router.route("/mysaveimagines").get(isLoggedIn, mySavedImagines);
router.route("/userflw/:id").get(isLoggedIn, getUserflw);

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
