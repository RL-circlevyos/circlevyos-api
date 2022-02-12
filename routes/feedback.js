const express = require("express");
const { isLoggedIn } = require("../middleware/user");
const {
  feedbackCreate,
  getFeedback,
} = require("../controller/feedbackController");

const router = express.Router();

router.post("/feedback", isLoggedIn, feedbackCreate);
router.get("/feedback", isLoggedIn, getFeedback);

module.exports = router;
