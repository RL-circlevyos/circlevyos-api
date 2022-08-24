const Question = require("../models/Question");
const BigPromise = require("./bigPromise");

exports.isQuestionAuthor = BigPromise(async (req, res, next) => {
  const question = await Question.findById(req.params.id);

  if (!question) {
    return res.status(400).json({
      msg: "No such question is exist",
    });
  }

  if (question.user.toString() !== req.user.id) {
    return res.status(401).json({ msg: "You are not authorized" });
  }

  next();
});
