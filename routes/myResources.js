const router = require("express").Router();
const { isLoggedIn } = require("../middleware/user");
const {
  createCourse,
  getAllCourses,
  getSingleCourse,
  updateCourse,
  deleteCourse,
  createSection,
  createvideocourse,
  getSection,
  getVideos,
  getUserCourses,
  getSingleVideo,
} = require("../controller/myResources/courseController");
const {
  isCourseAuthor,
  isExamAuthor,
  isMaterialAuthor,
} = require("../middleware/myResources/helper");
const {
  createExam,
  getAllExams,
  getSingleExam,
  updateExam,
  deleteExam,
} = require("../controller/myResources/examController");
const {
  createBook,
  updateBook,
  deleteBook,
  getAllBooks,
  getSingleBook,
} = require("../controller/myResources/bookController");
const {
  createMaterial,
  getMaterials,
  getSingleMaterial,
  updateMaterial,
  deleteMaterial,
  appriciateMaterial,
  commentMaterial,
  getCommentsMaterial,
  deletecommentMaterial,
  userMaterials,
} = require("../controller/myResources/materialController");
const {
  createMockPaper,
  getMockPapers,
  getSingleMockPaper,
  userMockPapers,
} = require("../controller/myResources/mockPaperController");

// public route

// course
router.route("/courses").get(getAllCourses);
router.route("/courses/:id").get(getSingleCourse);

// exam
router.route("/exams").get(getAllExams);
router.route("/exams/:id").get(getSingleExam);

// book
router.route("/books").get(getAllBooks);
router.route("/exams/:id").get(getSingleBook);

// private route

// course
router.route("/course").post(isLoggedIn, createCourse);
router
  .route("/courses/:id")
  .patch(isLoggedIn, isCourseAuthor, updateCourse)
  .delete(isLoggedIn, isCourseAuthor, deleteCourse);

// course -> section
router.route("/section/:courseid").post(isLoggedIn, createSection);
router.route("/sections/:courseid").get(isLoggedIn, getSection);
// course -> section -> video
router.route("/video/:sectionid").post(isLoggedIn, createvideocourse);
router.route("/videos/:sectionid").get(isLoggedIn, getVideos);
// single section video
router.route("/sectionvideos/:id").get(isLoggedIn, getSingleVideo);

// exam
router.route("/exam").post(isLoggedIn, createExam);
router
  .route("/exams/:id")
  .patch(isLoggedIn, isExamAuthor, updateExam)
  .delete(isLoggedIn, isExamAuthor, deleteExam);

// study materials
router.route("/material").post(isLoggedIn, createMaterial);
router.route("/materials").get(isLoggedIn, getMaterials);
router
  .route("/materials/:id")
  .get(isLoggedIn, getSingleMaterial)
  .patch(isLoggedIn, isMaterialAuthor, updateMaterial)
  .delete(isLoggedIn, isMaterialAuthor, deleteMaterial);
router.route("/materials/:id/appriciate").put(isLoggedIn, appriciateMaterial);
router.route("/materials/:id/comment").put(isLoggedIn, commentMaterial);
router.route("/materials/:id/comments").get(isLoggedIn, getCommentsMaterial);
router
  .route("/materials/:id/comments/:comment_id")
  .get(isLoggedIn, deletecommentMaterial);

// mock paper
router.route("/mockpaper").post(isLoggedIn, createMockPaper);
router.route("/mockpapers").get(isLoggedIn, getMockPapers);
router.route("/mockpapers/:id").get(isLoggedIn, getSingleMockPaper);

// user contribution
router.route("/mymaterials").get(isLoggedIn, userMaterials);
router.route("/mymockpapers").get(isLoggedIn, userMockPapers);
router.route("/mycourses").get(isLoggedIn, getUserCourses);
// admin only

// Exam
router
  .route("/exams/:id")
  .patch(isLoggedIn, updateExam)
  .delete(isLoggedIn, deleteExam);

router.route("/exam").post(isLoggedIn, createBook);
router
  .route("/exams/:id")
  .patch(isLoggedIn, updateBook)
  .delete(isLoggedIn, deleteBook);

module.exports = router;
