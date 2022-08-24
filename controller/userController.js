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
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendMail = require("./sendMail");
const { google } = require("googleapis");
const UserRequest = require("../models/UserRequest");
const UserCounselling = require("../models/UserCounselling");
const Skill = require("../models/Skill");
const JobExp = require("../models/JobExp");

const { OAuth2 } = google.auth;

const client = new OAuth2(process.env.MAILING_SERVICE_CLIENT_ID);

const { CLIENT_URL } = process.env;

// sign up : ✅
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({ msg: "Please fill in all fields." });
    }
    if (!validateEmail(email))
      return res.status(400).json({ msg: "Invalid emails." });

    let existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ msg: "This email already exists." });
    }

    if (password.length < 6)
      return res
        .status(400)
        .json({ msg: "Password must be at least 6 characters." });

    const passwordHash = await bcrypt.hash(password, 12);

    const newUser = {
      name,
      email,
      password: passwordHash,
    };

    // cookieToken(user, req, res);

    const activation_token = createActivationToken(newUser);

    const url = `${CLIENT_URL}/user/activate/${activation_token}`;

    sendMail(email, url, "Verify your email address");

    res.json({
      msg: "Please check your mail activate your email to start.",
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

// activate email :✅
exports.activateEmail = async (req, res) => {
  try {
    const { activation_token } = req.body;
    const user = jwt.verify(
      activation_token,
      process.env.ACTIVATION_TOKEN_SECRET
    );

    const { name, email, password } = user;

    const check = await User.findOne({ email });
    if (check)
      return res.status(400).json({ msg: "This email is already exists" });

    const newUser = new User({
      name,
      email,
      password,
    });

    await newUser.save();

    res.status(200).json({ msg: "Account has been activated!" });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

// login with email :✅
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // check for presence of email and password
    if (!email || !password) {
      return res.status(400).json({ msg: "Please fill all fields" });
    }

    // get user from db
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({ msg: "This email does not exists" });
    }

    // match password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Password incorrect" });
    }

    const refresh_token = createRefreshToken({ id: user._id });

    res.cookie("refreshtoken", refresh_token, {
      httpOnly: true,
      path: "/api/v1/refresh_token",
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.cookie("refreshtoken", refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({ msg: "Login success" });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

(exports.googleLogin = async (req, res) => {
  try {
    const { tokenId } = req.body;

    const verify = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.MAILING_SERVICE_CLIENT_ID,
    });

    const { email_verified, email, name, picture } = verify.payload;

    const password = email + process.env.GOOGLE_SECRET;

    const passwordHash = await bcrypt.hash(password, 12);

    if (!email_verified)
      return res.status(400).json({ msg: "Email verification failed." });

    const user = await User.findOne({ email }).select("+password");

    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({ msg: "Password is incorrect." });

      const refresh_token = createRefreshToken({ id: user._id });
      res.cookie("refreshtoken", refresh_token, {
        httpOnly: true,
        path: "/api/v1/refresh_token",
        secure: process.env.NODE_ENV === "production" ? true : false,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      res.cookie("refreshtoken", refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" ? true : false,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({ msg: "Login success!" });
    } else {
      const newUser = new User({
        name,
        email,
        password: passwordHash,
        avatar: picture,
      });

      await newUser.save();

      const refresh_token = createRefreshToken({ id: newUser._id });
      res.cookie("refreshtoken", refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" ? true : false,
        path: "/api/v1/refresh_token",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.cookie("refreshtoken", refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" ? true : false,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({ msg: "Login success!" });
    }
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
}),
  // get access token:✅
  (exports.getAccessToken = (req, res) => {
    try {
      const rf_token = req.cookies["refreshtoken"];
      console.log(rf_token, "refresh token");
      if (!rf_token) return res.status(400).json({ msg: "Please login now" });

      jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(400).json({ msg: "Please login now" });

        const access_token = createAccessToken({ id: user.id });

        res.json({ access_token });
      });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  });

// logout :✅
exports.logout = async (req, res) => {
  try {
    res.clearCookie("refreshtoken", { path: "/api/v1/refresh_token" });
    res.clearCookie("refreshtoken");

    return res.json({ msg: "Logout Success" });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

// forgot password
(exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ msg: "This email does not exists" });

    const access_token = createAccessToken({ id: user._id });
    const url = `${CLIENT_URL}/user/reset/${access_token}`;

    sendMail(email, url, "Reset password");
    res.json({ msg: "Please check your mail to reset your password" });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
}),
  // reset password
  (exports.resetPassword = async (req, res) => {
    try {
      const { password } = req.body;
      console.log(password);
      const passwordHash = await bcrypt.hash(password, 12);

      console.log(req.user);
      await User.findOneAndUpdate(
        { _id: req.user.id },
        {
          password: passwordHash,
        }
      );

      res.json({ msg: "Password successfully changed" });
    } catch (error) {}
  }),
  (exports.getLoggedInUserDetail = BigPromise(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user,
    });
  }));

// get only account
exports.getAccountDetail = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.params.id);

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

exports.resumeUpload = BigPromise(async (req, res, next) => {
  let resumeFile;

  console.log(req.files);

  if (req.files.resume) {
    resumeFile = await cloudinary.v2.uploader.upload(
      req.files.resume.tempFilePath,
      {
        folder: "resume",
      }
    );
  }

  const resume = resumeFile && {
    id: resumeFile.public_id,
    secure_url: resumeFile.secure_url,
  };

  req.body.resume = resume;

  const user = await User.findByIdAndUpdate(req.user.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({ user });
});

exports.addSkill = BigPromise(async (req, res, next) => {
  if (!req.body.skillname) {
    res.status(400).json({ msg: "skill name is required" });
  }

  newSkill = await Skill.create(req.body);

  User.findByIdAndUpdate(
    req.user.id,
    {
      $push: { skills: newSkill },
    },
    {
      new: true,
    },
    (err, result) => {
      if (err) {
        res.status(400).json({ msg: err });
      }
    }
  );
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

// * mentor

// * mentor request create
exports.mentorReq = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!req.body.organization || !req.body.designation) {
    return res.status(400).json({ msg: "Fill all the required fields" });
  }

  let verificationfilestore, resumeFileStore;

  if (req.files) {
    if (req.files.verificationFile) {
      console.log(req.files.verificationFile.tempFilePath);
      verificationfilestore = await cloudinary.v2.uploader.upload(
        req.files.verificationFile.tempFilePath,
        {
          folder: "userRequest",
        }
      );
    }

    if (req.files.resume) {
      resumeFileStore = await cloudinary.v2.uploader.upload(
        req.files.resume.tempFilePath,
        {
          folder: "userRequest",
        }
      );
    }
  }

  const verificationFile = verificationfilestore && {
    id: verificationfilestore.public_id,
    secure_url: verificationfilestore.secure_url,
  };

  const resume = resumeFileStore && {
    id: resumeFileStore.public_id,
    secure_url: resumeFileStore.secure_url,
  };

  req.body.user = user;
  req.body.verificationFile = verificationFile ? verificationFile : null;
  req.body.resume = resume ? resume : null;
  req.body.mentor = true;

  const userMentorRequest = await UserRequest.create(req.body);

  req.body.mentorStatus = true;
  req.body.mentor = true;
  req.body.generalStatus = false;
  await User.findByIdAndUpdate(req.user.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    success: true,
    userMentorRequest,
  });
});

// * get all mentor requests
exports.getMentorReqs = BigPromise(async (req, res, next) => {
  const mentorRequests = await UserRequest.find();

  res.status(200).json({
    mentorRequests,
  });
});

// * get single mentor request
exports.getSingleMentorReq = BigPromise(async (req, res, next) => {
  const mentorRequest = await UserRequest.findById(req.params.id);

  if (!mentorRequest) {
    return res.status(400).json({ msg: "No such mentor request is found" });
  }

  res.status(200).json({
    mentorRequest,
  });
});

// * delete mentor requests
exports.deleteMentorRequest = BigPromise(async (req, res, next) => {
  const mentorRequest = await UserRequest.findById(req.params.id);

  if (!mentorRequest) {
    return res.status(400).json({ msg: "No such mentor request is found" });
  }

  await mentorRequest.delete();

  req.body.mentorStatusMsg =
    "Your mentorship application is not accepted, try again";
  await User.findByIdAndUpdate(mentorRequest.user.id, req.body);

  res.status(200).json({
    msg: "Mentor Request deleted",
  });
});

// * turn user into mentor
// ! only admin access
exports.turnUserMentor = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(400).json({ msg: "User does not exiist" });
  }

  req.body.mentorStatus = !user.mentorStatus;

  await User.findByIdAndUpdate(req.params.id, req.body);

  res.status(200).json({ msg: "user turned into mentor" });
});

// * job provider
// * job provider request by user
exports.jobProviderReq = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!req.body.organization || !req.body.designation) {
    return res.status(400).json({ msg: "Fill all the required fields" });
  }

  let verificationfilestore, resumeFileStore;

  if (req.file) {
    if (req.files.verificationFile) {
      verificationfilestore = await cloudinary.v2.uploader.upload(
        req.files.verificationFile.tempFilePath,
        {
          folder: "userRequest",
        }
      );
    }

    if (req.files.resume) {
      resumeFileStore = await cloudinary.v2.uploader.upload(
        req.files.resume.tempFilePath,
        {
          folder: "userRequest",
        }
      );
    }
  }

  const verificationFile = verificationfilestore && {
    id: verificationfilestore.public_id,
    secure_url: verificationfilestore.secure_url,
  };

  const resume = resumeFileStore && {
    id: resumeFileStore.public_id,
    secure_url: resumeFileStore.secure_url,
  };

  req.body.user = user;
  req.body.verificationFile = verificationFile;
  req.body.resume = resume;
  req.body.jobProvider = true;

  const userJobProviderRequest = await UserRequest.create(req.body);

  req.body.jobProviderStatus = true;
  req.body.jobProvider = true;
  req.body.generalStatus = false;
  await User.findByIdAndUpdate(req.user.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    userJobProviderRequest,
  });
});

// * switch to mentor
exports.switchToMentor = BigPromise(async (req, res, next) => {
  req.body.mentorStatus = true;

  req.body.generalStatus = false;
  await User.findByIdAndUpdate(req.user.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

//  * switch to job provider
exports.switchToJobProvider = BigPromise(async (req, res, next) => {
  req.body.jobProviderStatus = true;

  req.body.generalStatus = false;
  await User.findByIdAndUpdate(req.user.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

// * switch to general
exports.switchToGeneral = BigPromise(async (req, res, next) => {
  req.body.jobProviderStatus = false;
  req.body.mentorStatus = false;
  req.body.generalStatus = true;
  await User.findByIdAndUpdate(req.user.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

// * get all job providers requests
exports.getJobProvidersReqs = BigPromise(async (req, res, next) => {
  const jobProvidersRequests = await UserRequest.find();

  res.status(200).json({
    jobProvidersRequests,
  });
});

// * get single mentor request
exports.getSingleJobProviderReq = BigPromise(async (req, res, next) => {
  const jobProviderRequest = await UserRequest.findById(req.params.id);

  if (!jobProviderRequest) {
    return res
      .status(400)
      .json({ msg: "No such job provider request is found" });
  }

  res.status(200).json({
    jobProviderRequest,
  });
});

// * delete mentor requests
exports.deleteJobProviderRequest = BigPromise(async (req, res, next) => {
  const jobProviderRequest = await UserRequest.findById(req.params.id);

  if (!jobProviderRequest) {
    return res.status(400).json({ msg: "No such mentor request is found" });
  }

  await jobProviderRequest.delete();

  req.body.jobProviderStatusMsg =
    "Your job provider application was not accepted, Please try again";
  await User.findByIdAndUpdate(mentorRequest.user.id, req.body);

  res.status(200).json({
    msg: "Job provider Request deleted",
  });
});

// * turn user into job provider
// ! only admin access
exports.turnUserJobProvider = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(400).json({ msg: "User does not exiist" });
  }

  req.body.jobProviderStatus = !user.jobProviderStatus;

  await User.findByIdAndUpdate(req.params.id, req.body);

  res.status(200).json({ msg: "user turned into job provider" });
});

// ** end of jov provider request

exports.authState = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate(
    "skills",
    "skillname verified"
  );

  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404).json({
      msg: "you are not logged in",
    });
  }
});

// follow and following user
exports.follow = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.body.id);

  // **********************
  const loggedInUser = await User.findById(req.user.id);

  // **************************

  if (!loggedInUser.following.includes(req.body.id)) {
    User.findByIdAndUpdate(
      req.body.id,
      {
        $push: { followers: req.user.id },
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

  const loggedInUser = await User.findById(req.user.id);

  if (loggedInUser.following.includes(req.body.id)) {
    User.findByIdAndUpdate(
      req.body.id,
      {
        $pull: { followers: req.user.id },
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

// get all mentor list
exports.getAllMentors = BigPromise(async (req, res, next) => {
  const mentors = await User.find().where("mentor").equals(true);

  res.status(200).json({
    success: true,
    mentors,
  });
});

// show all user posted imagines
exports.userImagines = BigPromise(async (req, res, next) => {
  const imagine = await Imagines.find({ user: req.params.id })
    .sort("-createdAt")
    .populate("user", "_id name photo");

  res.json({ imagine });
});

exports.mySavedImagines = BigPromise(async (req, res, next) => {
  const saveimagines = await User.findById(req.user.id).select("saveimagines");

  res.status(200).json({
    saveimagines,
  });
});

exports.addJobexp = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!req.body.companyname) {
    res.status(400).json("company name is required");
  }

  req.body.user = user;

  const newJobExp = await JobExp.create(req.body);

  User.findByIdAndUpdate(
    req.user.id,
    {
      $push: { jobexperience: newJobExp },
    },
    {
      new: true,
    }
  ).catch((err) => res.status(400).json(err));

  res.status(200).json(newJobExp);
});

// * get job experience
exports.getJobExperiences = BigPromise(async (req, res, next) => {
  const userJobExperiences = await User.findById(req.user.id).populate(
    "jobexperience",
    "_id companyname startDate endDate present expstatus"
  );

  res.status(200).json(userJobExperiences);
});

// counselling
// create counselling
exports.createCounselling = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  req.body.user = user;

  const userCounselling = await UserCounselling.create(req.body);

  res.status(200).json({
    success: true,
    userCounselling,
  });
});

exports.getAllCounselling = BigPromise(async (req, res, next) => {
  const allCousellings = await UserCounselling.find();

  res.status(200).json({
    success: true,
    allCousellings,
  });
});

exports.getSingleCounselling = BigPromise(async (req, res, next) => {
  const counselling = await UserCounselling.findById(req.params.id);

  res.status(200).json({
    counselling,
  });
});

// utilities
function validateEmail(email) {
  const re =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

const createActivationToken = (payload) => {
  return jwt.sign(payload, process.env.ACTIVATION_TOKEN_SECRET, {
    expiresIn: "5m",
  });
};

const createAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "30d",
  });
};

const createRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
};
