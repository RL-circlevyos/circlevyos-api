const Exam = require("../../models/myResources/Exam");
const User = require("../../models/User");
const BigPromise = require("../../middleware/bigPromise");

// * create exam by admin and organization
exports.createExam = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!req.body.name) {
    return res.status(400).json({ msg: "Name is required" });
  }

  req.body.user = user;

  const newExam = await Exam.create(req.body);

  res.status(200).json({
    success: true,
    newExam,
  });
});

// * exams read by anyone
exports.getAllExams = BigPromise(async (req, res, next) => {
  const Exams = await Exam.find().sort("-createdAt").populate({
    path: "user",
    select:
      "-__v -bio -saveimagines -followers -following -createdAt -imagines",
  }); // most recent

  res.status(200).json({
    success: true,
    Exams,
  });
});

// * exam item ready by anyone
exports.getSingleExam = BigPromise(async (req, res, next) => {
  const exam = await Exam.findById(req.params.id);

  if (!exam) {
    return res.status(200).json({
      msg: "Exam doesn't exist",
    });
  }

  res.status(200).json({
    success: true,
    exam,
  });
});

// * update course by admin and organization
exports.updateExam = BigPromise(async (req, res, next) => {
  const exam = await Exam.findById(req.params.id);

  if (!exam) {
    return res.status(400).json({
      msg: "Exam doesn't exits",
    });
  }

  let newCourseForUpdate = req.body;

  const updatedExam = await Exam.findByIdAndUpdate(
    req.params.id,
    newCourseForUpdate,
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
    updatedCourse,
  });
});

// * delete course by author
exports.deleteExam = BigPromise(async (req, res, next) => {
  const exam = await Exam.findById(req.params.id);

  if (!exam) {
    return res.status(400).json({
      msg: "Exam doesn't exits",
    });
  }

  await exam.remove();

  res.status(200).json({
    msg: "Exam deleted",
  });
});
