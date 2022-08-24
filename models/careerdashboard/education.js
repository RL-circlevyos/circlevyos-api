const { model, Schema } = require("mongoose");

const EducationSchema = new Schema({
  jobprofile: {
    type: Schema.ObjectId,
    ref: "jobprofile",
  },
  institutename: { type: String },
  degree: { type: String },
  fromdate: {
    type: Date,
  },
  todate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = model("education", EducationSchema);
