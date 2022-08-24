const BigPromise = require("../middleware/bigPromise");
const { findByIdAndUpdate } = require("../models/User");
const User = require("../models/User");
const UserJobprofile = require("../models/UserJobprofile");
const CustomError = require("../utils/customError");
const skill = require("../models/careerdashboard/skill");
const cloudinary = require("cloudinary");
const certificate = require("../models/careerdashboard/certificate");
const workExperience = require("../models/careerdashboard/workExperience");
const education = require("../models/careerdashboard/education");
const activity = require("../models/careerdashboard/activity");

// create job profile
exports.jobProfileCreate = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  req.body.user = user;
  const jobProfile = await UserJobprofile.create(req.body);
  req.body.jobprofile = jobProfile;

  await User.findByIdAndUpdate(req.user.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({ jobProfile });
});

// personal info
exports.personalInfo = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  const personalInfo = await UserJobprofile.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    personalInfo,
  });
});

// Skills
exports.skill = BigPromise(async (req, res, next) => {
  const userjobprofile = await UserJobprofile.findById(req.params.id);

  req.body.jobprofile = userjobprofile;

  const skillitem = await skill.create(req.body);

  userjobprofile.skills.unshift(skillitem);

  await userjobprofile.save();

  return res.status(200).json(userjobprofile);
});

exports.certificate = BigPromise(async (req, res, next) => {
  const userjobprofile = await UserJobprofile.findById(req.params.id);
  let documentFile;

  if (req.files) {
    if (req.files.document) {
      documentFile = await cloudinary.v2.uploader.upload(
        req.files.document.tempFilePath,
        {
          folder: "jobprofile",
        }
      );
    }
  }

  const document = documentFile && {
    id: documentFile.public_id,
    secure_url: documentFile.secure_url,
  };

  req.body.document = document ? document : null;
  req.body.jobprofile = userjobprofile;
  const newcertificate = await certificate.create(req.body);

  userjobprofile.certificates.unshift(newcertificate);

  await userjobprofile.save();

  return res.status(200).json(userjobprofile);
});

exports.workexperiences = BigPromise(async (req, res, next) => {
  const userjobprofile = await UserJobprofile.findById(req.params.id);

  let attachemntFile;

  if (req.files) {
    if (req.files.attachemnt) {
      attachemntFile = await cloudinary.v2.uploader.upload(
        req.files.attachemnt.tempFilePath,
        {
          folder: "jobprofile",
        }
      );
    }
  }

  const attachemnt = attachemntFile && {
    id: attachemntFile.public_id,
    secure_url: attachemntFile.secure_url,
  };

  req.body.attachemnt = attachemnt ? attachemnt : null;
  req.body.jobprofile = userjobprofile;
  const newWorkExp = await workExperience.create(req.body);

  userjobprofile.workexperiences.unshift(newWorkExp);

  await userjobprofile.save();

  return res.status(200).json(userjobprofile);
});

exports.education = BigPromise(async (req, res, next) => {
  const userjobprofile = await UserJobprofile.findById(req.params.id);

  req.body.jobprofile = userjobprofile;
  const newEducation = await education.create(req.body);

  userjobprofile.educations.unshift(newEducation);

  await userjobprofile.save();

  return res.status(200).json(userjobprofile);
});

exports.acitivity = BigPromise(async (req, res, next) => {
  const userjobprofile = await UserJobprofile.findById(req.params.id);

  let activityDocumentFile;

  if (req.files) {
    if (req.files.activityDocument) {
      activityDocumentFile = await cloudinary.v2.uploader.upload(
        req.files.activityDocument.tempFilePath,
        {
          folder: "jobprofile",
        }
      );
    }
  }

  const activityDocument = activityDocumentFile && {
    id: activityDocumentFile.public_id,
    secure_url: activityDocumentFile.secure_url,
  };

  req.body.activityDocument = activityDocument ? activityDocument : null;
  req.body.jobprofile = userjobprofile;
  const newActivity = await activity.create(req.body);

  userjobprofile.activities.unshift(newActivity);

  await userjobprofile.save();

  return res.status(200).json(userjobprofile);
});
