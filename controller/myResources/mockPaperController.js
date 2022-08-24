const BigPromise = require("../../middleware/bigPromise");

const cloudinary = require("cloudinary");
const User = require("../../models/User");
const MockExamPaper = require("../../models/myResources/MockExamPaper");

exports.createMockPaper = BigPromise(async (req, res, next) => {
  let questionFiletoCloud, answerFileToCloud;

  // check if introIMage file exists
  if (req.files) {
    if (req.files.questionfile) {
      questionFiletoCloud = await cloudinary.v2.uploader.upload(
        req.files.questionfile.tempFilePath,
        {
          folder: "mockpaper",
          crop: "scale",
        }
      );
    }

    // check if introIMage file exists
    if (req.files.answerfile) {
      answerFileToCloud = await cloudinary.v2.uploader.upload(
        req.files.answerfile.tempFilePath,
        {
          folder: "mockpaper",
          crop: "scale",
        }
      );
    }
  }

  if (!req.body.papername) {
    return next(new CustomeError("Name is required", 400));
  }

  const questionFile = questionFiletoCloud && {
    id: questionFiletoCloud.public_id,
    secure_url: questionFiletoCloud.secure_url,
  };

  const answerFile = answerFileToCloud && {
    id: answerFileToCloud.public_id,
    secure_url: answerFileToCloud.secure_url,
  };

  const user = await User.findById(req.user.id);

  (req.body.answerfile = answerFile ? answerFile : null),
    (req.body.questionfile = questionFile ? questionFile : null),
    (req.body.user = user);

  const newMockPaper = await MockExamPaper.create(req.body);

  res.status(201).json({
    success: true,
    newMockPaper,
  });
});

exports.getMockPapers = BigPromise(async (req, res, next) => {
  const mockPapers = await MockExamPaper.find().sort("-createdAt").populate({
    path: "user",
    select:
      "-__v -bio -saveimagines -followers -following -createdAt -imagines",
  }); // most recent

  res.status(200).json({
    success: true,
    mockPapers,
  });
});

// get user mock papers
exports.userMockPapers = BigPromise(async (req, res, next) => {
  const mockPapers = await MockExamPaper.find({ user: req.user.id })
    .sort("-createdAt")
    .populate("user", "_id name photo");

  res.json({ mockPapers });
});

exports.getSingleMockPaper = BigPromise(async (req, res, next) => {
  const singleMockPaper = await MockExamPaper.findById(req.params.id).populate({
    path: "user",
    select:
      "-__v -bio -saveimagines -followers -following -createdAt -imagines",
  });

  if (!singleMockPaper) {
    return res.status(404).json({ msg: "Paper not found" });
  }

  // Imagines.findByIdAndUpdate(req.params.id)

  res.status(200).json({
    success: true,
    singleMockPaper,
  });
});
