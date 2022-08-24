const express = require("express");
const {
  personalInfo,
  jobProfileCreate,
  skill,
  certificate,
  workexperiences,
  education,
  acitivity,
} = require("../controller/jobprofileController");
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
  turnUserMentor,
  getMentorReqs,
  getSingleMentorReq,
  mentorReq,
  deleteMentorRequest,
  getJobProvidersReqs,
  getSingleJobProviderReq,
  deleteJobProviderRequest,
  turnUserJobProvider,
  jobProviderReq,
  createCounselling,
  getAllCounselling,
  getSingleCounselling,
  getAllMentors,
  resumeUpload,
  switchToGeneral,
  switchToJobProvider,
  switchToMentor,
  addSkill,
  addJobexp,
  getJobExperiences,
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
router.route("/resume-upload").patch(isLoggedIn, resumeUpload);
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
router.route("/counsellingcreate").post(isLoggedIn, createCounselling);
router.route("/allcounsellings").get(isLoggedIn, getAllCounselling);
router.route("/allcounsellings/:id").get(isLoggedIn, getSingleCounselling);
router.route("/allmentors").get(isLoggedIn, getAllMentors);

// dashboard

// * job-profile
router.route("/jobprofile-create").post(isLoggedIn, jobProfileCreate);
router.route("/personalinfo/:id").put(isLoggedIn, personalInfo);
router.route("/skill/:id").put(isLoggedIn, skill);
router.route("/certificate/:id").put(isLoggedIn, certificate);
router.route("/workexperiences/:id").put(isLoggedIn, workexperiences);
router.route("/education/:id").put(isLoggedIn, education);
router.route("/acitivity/:id").put(isLoggedIn, acitivity);
router.route("/addskill").put(isLoggedIn, addSkill);
router.route("/addjobexp").post(isLoggedIn, addJobexp);
router.route("/getjobexps").get(isLoggedIn, getJobExperiences);

// mentor request by user
router.route("/mentorrequest").post(isLoggedIn, mentorReq);

// job provider requests by user
router.route("/jobproviderrequest").post(isLoggedIn, jobProviderReq);

// switch to job provider
router.route("/switchtojobprovider").patch(isLoggedIn, switchToJobProvider);

// switch to mentor
router.route("/switchtomentor").patch(isLoggedIn, switchToMentor);

// switch to general
router.route("/switchtogen").patch(isLoggedIn, switchToGeneral);

// admin only route
router.route("/admin/users").get(isLoggedIn, customRole("admin"), adminAllUser);
router
  .route("/admin/users/:id")
  .get(isLoggedIn, customRole("admin"), singleUser)
  .put(isLoggedIn, customRole("admin"), updateOneUserDetailsByAdmin)

  .delete(isLoggedIn, customRole("admin"), deleteOneUserByAdmin); // need testing

// mentor requests

router
  .route("/admin/mentorrequests")
  .get(isLoggedIn, customRole("admin"), getMentorReqs);
router
  .route("/admin/mentorrequests/:id")
  .get(isLoggedIn, customRole("admin"), getSingleMentorReq)
  .delete(isLoggedIn, customRole("admin"), deleteMentorRequest);

router
  .route("/admin/mentorrequests/:id/mentorapprove")
  .put(isLoggedIn, customRole("admin"), turnUserMentor);

// job provider
router
  .route("/admin/jobproviderReqs")
  .get(isLoggedIn, customRole("admin"), getJobProvidersReqs);
router
  .route("/admin/jobproviderReqs/:id")
  .get(isLoggedIn, customRole("admin"), getSingleJobProviderReq)
  .delete(isLoggedIn, customRole("admin"), deleteJobProviderRequest);

router
  .route("/admin/jobproviderReqs/:id/jobproviderapprove")
  .put(isLoggedIn, customRole("admin"), turnUserJobProvider);

// manager only route
router
  .route("/manager/users")
  .get(isLoggedIn, customRole("manager"), managerAllUser);
router
  .route("/manager/users/:id")
  .get(isLoggedIn, customRole("manager"), singleUser);

module.exports = router;
