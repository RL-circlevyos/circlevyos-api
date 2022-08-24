const router = require("express").Router();
const {
  createQuestion,
  getQuestions,
  getSingleQuestion,
  updateQuestion,
  deleteQuestion,
  createAnswer,
  getAllAnswersOfQid,
  updateAnswer,
  deleteAnswer,
  approveAnswer,
  appricateAns,
  questionLike,
  createPrivateQuestion,
  getAllRequestedQuestionOfUser,
  razorpayVerification,
  payWithRazorpay,
} = require("../controller/questionController");
const { isAnswerAuthor } = require("../middleware/Answer");
const { isQuestionAuthor } = require("../middleware/question");
const { isLoggedIn } = require("../middleware/user");

// public route
router.route("/questions").get(getQuestions);
router.route("/questions/:id").get(getSingleQuestion);
router.route("/questions/:id/answers").get(getAllAnswersOfQid);

// private route
router.route("/question").post(isLoggedIn, createQuestion);
router.route("/privatequestion").post(isLoggedIn, createPrivateQuestion);
router
  .route("/privatequestionreqs")
  .get(isLoggedIn, getAllRequestedQuestionOfUser);
router
  .route("/questions/:id")
  .patch(isLoggedIn, isQuestionAuthor, updateQuestion);

router
  .route("/questions/:id")
  .delete(isLoggedIn, isQuestionAuthor, deleteQuestion);

// question like
router.route("/questions/:id/like").put(isLoggedIn, questionLike);
//todo question dislike

// todo my questions

//  Answer
router.route("/questions/:id/answer").post(isLoggedIn, createAnswer);
router.route("/answers/:id").patch(isLoggedIn, isAnswerAuthor, updateAnswer);
router.route("/answers/:id").delete(isLoggedIn, isAnswerAuthor, deleteAnswer);

// accept answer by question author
router
  .route("/questions/:id/answers/:ans_id")
  .patch(isLoggedIn, isQuestionAuthor, approveAnswer);

// appricate answer
router.route("/answers/:id/appricate").put(isLoggedIn, appricateAns);

// todo my answer

module.exports = router;
