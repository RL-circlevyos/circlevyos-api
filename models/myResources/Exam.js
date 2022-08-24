const { Schema, model } = require("mongoose");

const ExamSchema = Schema({
  user: {
    type: Schema.ObjectId,
    ref: "User",
  },
  name: {
    type: String,
    required: [true, "Exam Name is required"],
  },
  details: {
    type: String,
  },
  portallink: {
    type: String,
  },
  applicationLink: {
    type: String,
  },
  applicationDatefrom: {
    type: Date,
  },
  applicationDateto: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = model("Exam", ExamSchema);
