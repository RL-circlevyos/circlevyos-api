const Job = require("../../models/Job");
const Course = require("../../models/myResources/Course");
const Exam = require("../../models/myResources/Exam");
const StudyMaterial = require("../../models/myResources/StudyMaterial");

const BigPromise = require("../bigPromise");

exports.isCourseAuthor = BigPromise(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return res.status(400).json({
      msg: "No such course is exist",
    });
  }

  if (course.user.toString() !== req.user.id) {
    return res.status(401).json({ msg: "You are not authorized" });
  }

  next();
});

exports.isExamAuthor = BigPromise(async (req, res, next) => {
  const exam = await Exam.findById(req.params.id);

  if (!exam) {
    return res.status(400).json({
      msg: "No such exam is exist",
    });
  }

  if (exam.user.toString() !== req.user.id) {
    return res.status(401).json({ msg: "You are not authorized" });
  }

  next();
});

exports.isMaterialAuthor = BigPromise(async (req, res, next) => {
  const material = await StudyMaterial.findById(req.params.id);

  if (!material) {
    return res.status(400).json({
      msg: "No such Material is exist",
    });
  }

  if (material.user.toString() !== req.user.id) {
    return res.status(401).json({ msg: "You are not authorized" });
  }

  next();
});

exports.isJobAuthor = BigPromise(async (req, res, next) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    return res.status(400).json({
      msg: "No such job is exist",
    });
  }

  if (job.user.toString() !== req.user.id) {
    return res.status(401).json({ msg: "You are not authorized" });
  }

  next();
});
