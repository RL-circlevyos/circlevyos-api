const BigPromise = require("../middleware/bigPromise");
const Career = require("../models/Career");
const feedback = require("../models/feedback");
const User = require("../models/User");
const CustomError = require("../utils/customError");

exports.createCareer = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  req.body.user = user;
  const career = await Career.create(req.body);
  req.body.career = career;
  await User.findByIdAndUpdate(req.user.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json(career);
});

exports.updateCareer = BigPromise(async (req, res, next) => {
  const career = await Career.findById(req.params.id);
  if (!career) {
    res.status(400).json({ msg: "Career isn't declared" });
  }

  const updatedCareer = await Career.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json(updatedCareer);
});

exports.getCareer = BigPromise(async (req, res, next) => {
  const career = await Career.findById(req.params.id);

  res.status(200).json(career);
});
