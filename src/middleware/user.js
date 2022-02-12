const User = require("../models/User");
const BigPromise = require("../middleware/bigPromise");
const CustomeError = require("../utils/customError");
const jwt = require("jsonwebtoken");

exports.isLoggedIn = BigPromise(async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return next(new CustomeError("Login first to access this page", 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  req.user = await User.findById(decoded.id);

  next();
});

exports.customRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new CustomeError("Your are not allowed for this resource", 403)
      );
    }
    next();
  };
};
