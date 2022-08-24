const { Schema, model } = require("mongoose");

const MockExamPaperSchema = Schema({
  user: {
    type: Schema.ObjectId,
    ref: "User",
  },
  papername: {
    type: String,
  },
  details: {
    type: String,
  },
  questionfile: {
    id: {
      type: String,
    },
    secure_url: {
      type: String,
    },
  },
  answerfile: {
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

module.exports = model("MockExamPaperSchema", MockExamPaperSchema);
