const { Schema, model } = require("mongoose");

const AnswerSchema = Schema({
  user: {
    type: Schema.ObjectId,
    ref: "User",
    required: true,
  },
  question: {
    type: Schema.ObjectId,
    ref: "Question",
  },
  body: {
    type: String,
  },
  appriciates: [
    {
      type: Schema.ObjectId,
      ref: "User",
    },
  ],
  accept: {
    type: Boolean,
    default: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = model("Answer", AnswerSchema);
