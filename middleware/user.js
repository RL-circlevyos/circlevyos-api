const User = require("../models/User");
const BigPromise = require("../middleware/bigPromise");
const CustomeError = require("../utils/customError");
const jwt = require("jsonwebtoken");

exports.isLoggedIn = (req, res, next) => {
  try {
    const token = req.header("Authorization");
    console.log(token);
    if (!token) return res.status(400).json({ msg: "Invalid Authentication" });

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) return res.status(400).json({ msg: "Invalid Authentication" });

      req.user = user;
      next();
    });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

exports.customRole = (...roles) => {
  return async (req, res, next) => {
    const user = await User.findById(req.user.id);
    if (!roles.includes(user.role)) {
      return next(
        new CustomeError("Your are not allowed for this resource", 403)
      );
    }
    next();
  };
};
