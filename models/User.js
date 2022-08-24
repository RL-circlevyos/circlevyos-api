const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const UserSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
    maxLength: [40, "Name should be under 40 charecters"],
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    validate: [validator.isEmail, "Please enter in correct format"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: [9, "password should be atleast 9 char"],
    select: false,
  },
  generalStatus: {
    type: Boolean,
    default: true,
  },

  mentorStatus: {
    type: Boolean,
    default: false,
  },
  mentor: {
    type: Boolean,
    default: false,
  },
  mentorStatusMsg: {
    type: String,
  },
  jobProviderStatus: {
    type: Boolean,
    default: false,
  },
  jobProvider: {
    type: Boolean,
    default: false,
  },
  jobProviderStatusMsg: {
    type: String,
  },

  photo: {
    id: {
      type: String,
    },
    secure_url: {
      type: String,
    },
  },
  bio: {
    type: String,
  },
  resume: {
    id: {
      type: String,
    },
    secure_url: {
      type: String,
    },
  },
  skills: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "userskill",
    },
  ],
  jobprofile: {
    type: mongoose.Schema.ObjectId,
    ref: "jobprofile",
  },
  jobexperience: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "jobexp",
    },
  ],
  career: {
    type: mongoose.Schema.ObjectId,
    ref: "career",
  },
  followers: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  ],
  following: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  ],
  imagines: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Imagine",
    },
  ],
  saveimagines: [
    {
      imagine: {
        type: mongoose.Schema.ObjectId,
        ref: "Imagine",
      },
    },
  ],
  role: {
    type: String,
    default: "general",
  },

  forgotPasswordToken: {
    type: String,
  },
  forgotPasswordExpiry: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// // encrypt password before save - HOOKS
// UserSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) {
//     return next();
//   }
//   this.password = await bcrypt.hash(this.password, 12);
// });

// // validate the password with passed on user password
// UserSchema.methods.isValidatedPassword = async function (userSendPassword) {
//   return await bcrypt.compare(userSendPassword, this.password);
// };

// // create and return jwt token
// UserSchema.methods.getJwtToken = function () {
//   payload = {
//     id: this._id,
//     email: this.email,
//   };

//   return jwt.sign(payload, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_EXPIRY,
//   });
// };

// generate forgot password token (string)
// UserSchema.methods.getForgotPasswordToken = function () {
//   // generate a long random string
//   const forgotToken = crypto.randomBytes(20).toString("hex");

//   //   getting a hash - make sure to get a hash on backend
//   this.forgotPasswordToken = crypto
//     .createHash("sha256")
//     .update(forgotToken)
//     .digest("hex");

//   // time of token
//   this.forgotPasswordExpiry = Date.now() + 20 * 60 * 1000;

//   return forgotToken;
// };

module.exports = mongoose.model("User", UserSchema);
