const router = require("express").Router();
const { isLoggedIn } = require("../middleware/user");
const {
  createCareer,
  updateCareer,
  getCareer,
} = require("../controller/careerController");
const {
  createCareerSubjectAndSyllabus,
  addSubject,
  getCareerSubjectAndSyllabusDetails,
  getUserReqCareerSubjectAndSyllabusDetails,
} = require("../controller/careerSubject/careerSubjectController");

router.route("/create-career").post(isLoggedIn, createCareer);
router
  .route("/career/:id")
  .get(isLoggedIn, getCareer)
  .patch(isLoggedIn, updateCareer);

// career subject details
router.route("/create-subjectdetails").post(createCareerSubjectAndSyllabus);
router.route("/addsubject/:careersubjectid").post(addSubject);
router.route("/subjectandsyllabus").get(getCareerSubjectAndSyllabusDetails);
router
  .route("/userrequestedSubjectsyllabus")
  .get(getUserReqCareerSubjectAndSyllabusDetails);

module.exports = router;
