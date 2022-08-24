const { model, Schema } = require("mongoose");

const UserJobprofileSchema = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: "user",
  },
  desgnation: {
    type: String,
  },
  location: {
    type: String,
  },
  personalinfo: {
    type: String,
  },
  skills: [
    {
      type: Schema.ObjectId,
      ref: "skill",
    },
  ],
  certificates: [
    {
      type: Schema.ObjectId,
      ref: "certificate",
    },
  ],
  workexperiences: [
    {
      type: Schema.ObjectId,
      ref: "workexp",
    },
  ],
  educations: [
    {
      type: Schema.ObjectId,
      ref: "education",
    },
  ],
  activities: [
    {
      type: Schema.ObjectId,
      ref: "activity",
    },
  ],
});

module.exports = model("jobprofile", UserJobprofileSchema);
