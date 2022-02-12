const BigPromise = require("../middleware/bigPromise");
const Imagines = require("../models/Imagines");
const User = require("../models/User");

const CustomeError = require("../utils/customError");

exports.isAuthor = BigPromise(async (req, res, next) => {
  const imagine = await Imagines.findById(req.params.id);

  if (!imagine) {
    return next(new CustomeError("No Imagines found", 404));
  }

  if (imagine.user.toString() !== req.user.id) {
    return next(new CustomeError("You are not authorized", 401));
  }

  next();
});
