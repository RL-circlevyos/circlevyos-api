const { model, Schema } = require("mongoose");

const WorkExperienceSchema = new Schema({
  jobprofile: {
    type: Schema.ObjectId,
    ref: "jobprofile",
  },
  projectname: { type: String },
  companyname: { type: String },
  workfromdate: {
    type: Date,
  },
  worktodate: {
    type: Date,
  },
  attachemnt: {
    id: {
      type: String,
    },
    secure_url: {
      type: String,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = model("workexp", WorkExperienceSchema);
