const { model, Schema } = require("mongoose");

const UserRequestSchema = Schema({
  user: {
    type: Schema.ObjectId,
    ref: "User",
  },
  organization: {
    type: String,
  },
  designation: {
    type: String,
  },
  mentor: {
    type: Boolean,
    default: false,
  },
  jobProvider: {
    type: Boolean,
    default: false,
  },
  verificationFile: {
    id: {
      type: String,
    },
    secure_url: {
      type: String,
    },
  },
  resume: {
    id: {
      type: String,
    },
    secure_url: {
      type: String,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = model("UserRequest", UserRequestSchema);
