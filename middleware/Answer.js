const Answer = require("../models/Answer");
const Question = require("../models/Question");
const BigPromise = require("./bigPromise");

exports.isAnswerAuthor = BigPromise(async (req, res, next) => {
  const answer = await Answer.findById(req.params.id);

  if (!answer) {
    return res.status(400).json({
      msg: "No such answer is exist",
    });
  }

  if (answer.user.toString() !== req.user.id) {
    return res.status(401).json({ msg: "You are not authorized" });
  }

  next();
});
