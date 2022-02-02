const User = require("../models/User");
const BigPromise = require("../middleware/bigPromise");
const CustomeError = require("../utils/customError");
const cookieToken = require("../utils/cookieToken");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary");
const crypto = require("crypto");
const mailHelper = require("../utils/emailHelper");
const CustomError = require("../utils/customError");
const gravatar = require("gravatar");
const Imagines = require("../models/Imagines");

exports.signup = BigPromise(async (req, res, next) => {
  let file;
  let result;

  // if file exists then preceed for file upload
  if (req.files) {
    file = req.files.photo;

    result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
      folder: "users",
      width: 150,
      crop: "scale",
    });
  }

  const { name, email, password } = req.body;

  let existingUser = await User.findOne({ $or: [{ email }, { name }] });

  if (existingUser) {
    return res.status(400).json({ errors: [{ msg: "User already exists" }] });
  }
  if (!email || !name || !password) {
    return next(new CustomeError("Name, email and password is required", 400));
  }

  let photo = result && {
    id: result.public_id,
    secure_url: result.secure_url,
  };

  const hash = crypto.randomBytes(16).toString("hex");

  console.log(photo, "expecting gravatar");
  const user = await User.create({
    name,
    email,
    password,
    photo: photo,
    hash,
  });

  const verificationToken = user.generateVerificationToken();

  // Step 3 - Email the user a unique verification link
  const url = `http://localhost:3000/api/verify/${verificationToken}`;
  html = `Click <a href = '${url}'>here</a> to confirm your email.`;
  try {
    const options = {
      email: email,
      subject: "Verification mail",
      message: `copy pase you link to browser ${html}`,
    };
    await mailHelper(options);
    res.status(200).json({
      success: true,
      message: "email sent succesfully",
    });
  } catch (error) {
    res.status(500).json({
      success: true,
      message: error,
    });
  }

  return res.json({ user });
  // cookieToken(user, req, res);
});

exports.login = BigPromise(async (req, res, next) => {
  const { email, password } = req.body;

  // check for presence of email and password
  if (!email || !password) {
    return next(new CustomeError("Please provide email and password", 400));
  }

  // get user from db
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new CustomeError("Email or password does not exits", 400));
  }

  // match password
  const isPasswordCorrect = await user.isValidatedPassword(password);

  if (!isPasswordCorrect) {
    return next(new CustomeError("Email or password does not exits", 400));
  }

  if (user.hash) {
    return next(new CustomeError("Email verification required", 400));
  }

  // if all🆗 send token
  cookieToken(user, req, res);
});

exports.logout = BigPromise(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    messgae: "Logout success",
  });
});

// forgot password
exports.forgotPassword = BigPromise(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return next(new CustomeError("Email not found as registerd", 400));
  }

  const forgotToken = user.getForgotPasswordToken();

  await user.save({ validateBeforeSave: false });

  const myUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${forgotToken}`;

  const message = `Copy paste this link in your url and hit enter \n\n ${myUrl}`;

  try {
    const options = {
      email: user.email,
      subject: "Password reset mail",
      message,
    };
    await mailHelper(options);
    res.status(200).json({
      success: true,
      message: "email sent succesfully",
    });
  } catch (error) {
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new CustomeError(error.message, 500));
  }
});

// reset password
exports.resetPassword = BigPromise(async (req, res, next) => {
  const token = req.params.token;

  const encyptedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    encyptedToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return next(new CustomeError("Token is invalid or expired"));
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(
      new CustomeError("Password and confirm password don't match", 400)
    );
  }

  user.password = req.body.password;

  user.forgotPasswordToken = undefined;
  userforgotPasswordExpiry = undefined;

  await user.save();

  // send a JSON response
  cookieToken(user, req, res);
});

exports.getLoggedInUserDetail = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

exports.getUserDetail = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.params.id).populate(
    "followers following",
    "_id name photo email"
  );

  res.status(200).json({
    success: true,
    user,
  });
});

exports.getUserflw = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  res.status(200).json({
    success: true,
    user,
  });
});

exports.getMyDetail = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

exports.changePassword = BigPromise(async (req, res, next) => {
  const userId = req.user.id;

  const user = await User.findById(userId).select("+password");

  const IsCorrectOldPassword = await user.isValidatedPassword(
    req.body.oldPassword
  );

  if (!IsCorrectOldPassword) {
    return next(new CustomError("old password is incorrect"));
  }

  user.password = req.body.password;

  await user.save();

  cookieToken(user, req, res);
});

exports.verifyEmail = BigPromise(async (req, res, next) => {
  const userhash = await User.findOne({ hash: req.params.hash });

  if (userhash) {
    await User.updateOne({ _id: userhash._id }, { $set: { hash: "" } });
    return res.json({ success: true });
  }
  return res.json({ success: false });
});

exports.updateUserDetails = BigPromise(async (req, res, next) => {
  let existingUser = await User.findOne({
    email: req.body.email,
  });

  if (existingUser) {
    return res.status(400).json({ errors: [{ msg: "User already exists" }] });
  }

  const newData = {
    name: req.body.name,
    email: req.body.email,
    bio: req.body.bio,
  };

  if (req.files) {
    const user = await User.findById(req.user.id);
    const imageId = user.photo.id;

    if (imageId) {
      //  delete photo on cloudinary
      const resp = await cloudinary.v2.uploader.destroy(imageId);
    }

    //  upload new photo
    const result = await cloudinary.v2.uploader.upload(
      req.files.photo.tempFilePath,
      {
        folder: "users",
        width: 150,
        crop: "scale",
      }
    );

    newData.photo = {
      id: result.public_id,
      secure_url: result.secure_url,
    };
  }

  const user = await User.findByIdAndUpdate(req.user.id, newData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    user,
  });
});

exports.adminAllUser = BigPromise(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
});

exports.singleUser = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new CustomError("No user found", 400));
  }

  res.status(200).json({
    success: true,
    user,
  });
});

exports.updateOneUserDetailsByAdmin = BigPromise(async (req, res, next) => {
  const newData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role, // add dropdown to frontend
  };

  const user = await User.findByIdAndUpdate(req.params.id, newData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    user,
  });
});

// delete one user
exports.deleteOneUserByAdmin = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new CustomError("No Such user found", 401));
  }
  const imageId = user.photo.id;

  //  delete photo on cloudinary
  await cloudinary.v2.uploader.destroy(imageId);

  await user.remove();

  res.status(200).json({
    success: true,
  });
});

exports.managerAllUser = BigPromise(async (req, res, next) => {
  const users = await User.find({ role: "user" });

  res.status(200).json({
    success: true,
    users,
  });
});

exports.authState = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (user) {
    res.status(200).json(user);
  }

  res.status(404).json({
    msg: "you are not logged in",
  });
});

// follow and following user
exports.follow = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.body.id);

  if (!user.followers.includes(req.user.id)) {
    User.findByIdAndUpdate(
      req.body.id,
      {
        $push: { followers: req.user._id },
      },
      {
        new: true,
      },
      (err, result) => {
        if (err) {
          return res.status(422).json({ msg: err });
        }

        User.findByIdAndUpdate(
          req.user.id,
          {
            $push: { following: req.body.id },
          },
          { new: true }
        )
          .then((result) => {
            res.io.emit("follow");
            res.json(result);
          })
          .catch((err) => {
            return res.status(422).json({ msg: err });
          });
      }
    );
  } else {
    res.status(400).json({
      msg: "you already following",
    });
  }
});

// unfollow
exports.unfollow = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.body.id);
  if (user.followers.includes(req.user.id)) {
    User.findByIdAndUpdate(
      req.body.id,
      {
        $pull: { followers: req.user._id },
      },
      {
        new: true,
      },
      (err, result) => {
        if (err) {
          return res.status(422).json({ msg: err });
        }

        User.findByIdAndUpdate(
          req.user.id,
          {
            $pull: { following: req.body.id },
          },
          { new: true }
        )
          .then((result) => {
            res.io.emit("unfollow");
            res.json(result);
          })
          .catch((err) => {
            return res.status(422).json({ msg: err });
          });
      }
    );
  } else {
    res.json({ msg: "you are not following, follow first" });
  }
});

// show all user posted imagines
exports.userImagines = BigPromise(async (req, res, next) => {
  const imagine = await Imagines.find({ user: req.params.id })
    .sort("-createdAt")
    .populate("user", "_id name");

  res.json({ imagine });
});

exports.mySavedImagines = BigPromise(async (req, res, next) => {
  const saveimagines = await User.findById(req.user.id).select("saveimagines");

  res.status(200).json({
    saveimagines,
  });
});
