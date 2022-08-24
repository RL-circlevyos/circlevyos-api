const { Schema, model } = require("mongoose");

const JobSchema = Schema({
  user: {
    type: Schema.ObjectId,
    ref: "User",
  },
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  salary: {
    type: String,
  },
  experience: {
    type: String,
  },
  requirements: {
    type: String,
  },
  jobtype: {
    type: String,
  },
  jobseekers: [
    {
      type: Schema.ObjectId,
      ref: "User",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = model("job", JobSchema);
