const { model, Schema } = require("mongoose");

const JobExpSchema = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: "user",
  },
  companyname: {
    type: String,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  present: {
    type: Boolean,
    default: false,
  },
  expstatus: {
    type: String,
    default: "Fresher",
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = model("jobexp", JobExpSchema);
