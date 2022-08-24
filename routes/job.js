const { isLoggedIn } = require("../middleware/user");
const {
  createJob,
  getAllJobs,
  getSingleJob,
  updateJob,
  deleteJob,
  jobApply,
  getAllUserCreatedJobs,
  jobseekersList,
} = require("../controller/jobController");
const { isJobAuthor } = require("../middleware/myResources/helper");
const router = require("express").Router();

// public
router.route("/jobs").get(getAllJobs);
router.route("/jobs/:id").get(getSingleJob);

// private

router.route("/job").post(isLoggedIn, createJob);
router.route("/jobs/:id/jobseekers").get(isLoggedIn, jobseekersList);
router.route("/usercreatedjobs").get(isLoggedIn, getAllUserCreatedJobs);
router
  .route("/jobs/:id")
  .patch(isLoggedIn, isJobAuthor, updateJob)
  .delete(isLoggedIn, isJobAuthor, deleteJob);

router.route("/jobs/:id/apply").put(isLoggedIn, jobApply);
module.exports = router;
