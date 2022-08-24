const User = require("../models/User");
const BigPromise = require("../middleware/bigPromise");
const Job = require("../models/Job");

// * create job by job provider and organization
exports.createJob = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!req.body.title) {
    return res.status(400).json({ msg: "title is required" });
  }

  req.body.user = user;

  const newJob = await Job.create(req.body);

  res.status(200).json({
    success: true,
    newJob,
  });
});

// * jobs read by anyone
exports.getAllJobs = BigPromise(async (req, res, next) => {
  const jobs = await Job.find().sort("-createdAt").populate({
    path: "user",
    select:
      "-__v -bio -saveimagines -followers -following -createdAt -imagines",
  }); // most recent

  res.status(200).json({
    success: true,
    jobs,
  });
});

// * get all jobs created by user
exports.getAllUserCreatedJobs = BigPromise(async (req, res, next) => {
  const userCreatedjobs = await Job.find({ user: req.user.id })

    .sort("-createdAt")
    .populate({
      path: "user",
      select:
        "-__v -bio -saveimagines -followers -following -createdAt -imagines",
    });

  res.status(200).json({
    success: true,
    userCreatedjobs,
  });
});

// *
exports.getSingleJob = BigPromise(async (req, res, next) => {
  const job = await Job.findById(req.params.id)
    .populate("user", "name photo _id ")
    .populate("jobseekers", "_id name resume photo");

  if (!job) {
    return res.status(200).json({
      msg: "Job doesn't exist",
    });
  }

  res.status(200).json({
    success: true,
    job,
  });
});

// * update job by job provider and organization
exports.updateJob = BigPromise(async (req, res, next) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    return res.status(400).json({
      msg: "job doesn't exits",
    });
  }

  let newJobForUpdate = req.body;

  const updatedJob = await Exam.findByIdAndUpdate(
    req.params.id,
    newJobForUpdate,
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
    updatedJob,
  });
});

// * delete job
exports.deleteJob = BigPromise(async (req, res, next) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    return res.status(400).json({
      msg: "Job doesn't exits",
    });
  }

  await job.remove();

  res.status(200).json({
    msg: "Exam deleted",
  });
});

// applied job seekers list
exports.jobseekersList = BigPromise(async (req, res, next) => {
  const jobseekers = await Job.findById(req.params.id).populate(
    "jobseekers",
    "_id name email resume"
  );

  res.status(200).json(jobseekers);
});

// job apply
exports.jobApply = BigPromise(async (req, res, next) => {
  const job = await Job.findById(req.params.id);

  const user = await User.findById(req.user.id);

  job.jobseekers.unshift(user);

  await job.save();

  res.status(200).json({
    jobSeekers: job.jobseekers,
  });
});
