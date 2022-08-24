const BigPromise = require("../middleware/bigPromise");
const Answer = require("../models/Answer");
const Question = require("../models/Question");
const RequestQuestion = require("../models/RequestQuestion");
const User = require("../models/User");
const CustomError = require("../utils/customError");

// * create question
// todo remove customerr and add responsd message
exports.createQuestion = BigPromise(async (req, res, next) => {
  // fetch user, who post new question
  const user = await User.findById(req.user.id);

  // check title is given or not
  if (!req.body.title) {
    return res.status(400).json({ msg: "Question title is required" });
  }

  req.body.user = user;

  const newQuestion = await Question.create(req.body);

  res.io.emit("question-create");

  res.status(201).json({
    success: true,
    newQuestion,
  });
});

// * create Private Qustion
exports.createPrivateQuestion = BigPromise(async (req, res, next) => {
  // fetch user, who post new question
  const user = await User.findById(req.user.id);

  console.log(req.body.selectedMentor);
  // fetch user based on select
  const selectuser = await User.findById(req.body.selectedMentor);

  // check title is given or not
  if (!req.body.title) {
    return res.status(400).json({ msg: "Question title is required" });
  }

  req.body.user = user;
  req.body.private = true;

  const newQuestion = await Question.create(req.body);

  const createRequestquestion = {
    user: selectuser,
    requestedUser: user,
    question: newQuestion,
  };

  const newPrivateQuestion = await RequestQuestion.create(
    createRequestquestion
  );

  res.io.emit("question-create-private");

  res.status(201).json({
    success: true,
    newPrivateQuestion,
  });
});

//* get all questions
exports.getQuestions = BigPromise(async (req, res, next) => {
  const limitVal = 20;
  const skipVal = limitVal * req.query.skipCount;
  const Questions = await Question.find()
    .sort("-createdAt")
    // .sort(["private", false])
    .where("private")
    .equals(false)
    .limit(limitVal)
    .skip(skipVal)
    .populate({
      path: "user",
      select:
        "-__v -bio -saveimagines -followers -following -createdAt -imagines",
    }); // most recent

  res.status(200).json({
    success: true,
    Questions,
  });
});

// * get all requested question logged in user
exports.getAllRequestedQuestionOfUser = BigPromise(async (req, res, next) => {
  const reqQues = await RequestQuestion.find({ user: req.user.id })
    .sort("-createdAt")
    .populate("question", "title body likes createdAt")
    .populate(
      "requestedUser",
      "-__v -bio -saveimagines -followers -following -createdAt -imagines"
    );

  res.status(200).json({ success: true, reqQues });
});

// * get single question
exports.getSingleQuestion = BigPromise(async (req, res, next) => {
  const question = await Question.findById(req.params.id).populate({
    path: "user",
    select:
      "-__v -bio -saveimagines -followers -following -createdAt -imagines",
  });

  if (!question) {
    return res.status(400).json({ msg: "No such question is found" });
  }

  res.status(200).json({
    success: true,
    question,
  });
});

//* update question
exports.updateQuestion = BigPromise(async (req, res, next) => {
  // check question exists or not
  const question = Question.findById(req.params.id);

  if (!question) {
    return res.status(400).json({ msg: "No such question is found" });
  }

  if (!req.body.title) {
    return res.status(400).json({ msg: "Question title is required" });
  }

  const newQuestionUpdate = req.body;

  const updatedQuestion = await Question.findByIdAndUpdate(
    req.params.id,
    newQuestionUpdate,
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.io.emit("question-update");
  res.status(200).json({
    success: true,
    updatedQuestion,
  });
});

// * remove question
exports.deleteQuestion = BigPromise(async (req, res, next) => {
  const question = await Question.findById(req.params.id);

  if (!question) {
    return res.status(400).json({ msg: "No such question is exits" });
  }

  await question.remove();

  res.io.emit("question-delete");

  res.status(200).json({
    msg: "Question Deleted",
  });
});

// * question like
exports.questionLike = BigPromise(async (req, res, next) => {
  const question = await Question.findById(req.params.id);

  if (!question) {
    return res.status(400).json({ msg: "question does not exits" });
  }

  if (question.likes.some((likeuser) => likeuser.toString() === req.user.id)) {
    question.likes = question.likes.filter(
      (like) => like.toString() !== req.user.id
    );
  } else {
    question.likes.unshift(req.user.id);
  }

  await question.save();

  res.io.emit("question-like");
  res.status(200).json({
    success: true,
    question,
  });
});

// * Answer create
exports.createAnswer = BigPromise(async (req, res, next) => {
  // find question qhich answers are belong to
  const question = await Question.findById(req.params.id);

  if (!question) {
    return res.status(400).json({
      msg: "No such question is found",
    });
  }

  const user = await User.findById(req.user.id);

  if (!req.body.body) {
    return res.status(400).json({ msg: "Answer is required" });
  }

  req.body.question = question;
  req.body.user = user;

  const newAnswer = await Answer.create(req.body);

  question.answer.unshift(newAnswer._id);

  res.io.emit("answer-create");
  res.status(200).json({
    success: true,
    newAnswer,
  });
});

//* get all answers of specific quesion
exports.getAllAnswersOfQid = BigPromise(async (req, res, next) => {
  const question = await Question.findById(req.params.id);

  if (!question) {
    return res.status(200).json({
      msg: "No such question is found",
    });
  }

  const answers = await Answer.find({ question: question._id }).populate(
    "user",
    "_id name photo"
  );

  res.status(200).json({
    success: true,
    answers,
  });
});

// * update answer
exports.updateAnswer = BigPromise(async (req, res, next) => {
  const answer = await Answer.findById(req.params.id);

  if (!answer) {
    return res.status(200).json({ msg: "No such answer is exist" });
  }

  const newAnswerUpdate = req.body;

  const updatedAnswer = await Answer.findByIdAndUpdate(
    req.params.id,
    newAnswerUpdate,
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.io.emit("answer-update");
  res.status(200).json({
    success: true,
    updatedAnswer,
  });
});

//* delete answer
exports.deleteAnswer = BigPromise(async (req, res, next) => {
  const answer = await Answer.findById(req.params.id);

  if (!answer) {
    return res.status(200).json({ msg: "No such answer is exist" });
  }

  await answer.remove();

  res.io.emit("answer-remove");
  res.status(200).json({
    msg: "Answer deleted",
  });
});

// * answer approve
exports.approveAnswer = BigPromise(async (req, res, next) => {
  const answer = await Answer.findById(req.params.ans_id);

  if (!answer) {
    return res.status(400).json({ msg: "No such answer is exist" });
  }

  req.body.accept = !answer.accept;
  const approvedAns = await Answer.findByIdAndUpdate(
    req.params.ans_id,
    req.body
  );

  res.io.emit("approve-answer");
  res.status(200).json({
    approvedAns,
  });
});

// * appriciate answer
exports.appricateAns = BigPromise(async (req, res, next) => {
  const answer = await Answer.findById(req.params.id);

  if (!answer) {
    return res.status(400).json({ msg: "No such answer is exist" });
  }

  if (
    answer.appriciates.some(
      (appriciateuser) => appriciateuser.toString() === req.user.id
    )
  ) {
    answer.appriciates = answer.appriciates.filter(
      (ap) => ap.toString() !== req.user.id
    );
  } else {
    answer.appriciates.unshift(req.user.id);
  }

  await answer.save();

  res.io.emit("answer-appriciate");
  res.status(200).json({
    success: true,
    answer,
  });
});
