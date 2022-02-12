const BigPromise = require("../middleware/bigPromise");
const feedback = require("../models/feedback");
const CustomError = require("../utils/customError");

// feedback create
exports.feedbackCreate = BigPromise(async (req, res, next) => {
  if (req.body.rating > 5) {
    return next(CustomError("rating should not e more than 5"));
  }

  const response = await feedback.create(req.body);

  res.status(201).json({
    success: true,
    feedback: response,
  });
});

// get all feedbacks
exports.getFeedback = BigPromise(async (req, res, next) => {
  const feedbackList = await feedback.find();

  res.status(200).json({
    feedbackList: feedbackList,
  });
});
