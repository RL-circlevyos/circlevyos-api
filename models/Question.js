const { Schema, model } = require("mongoose");

const QuestionSchema = Schema({
  user: {
    type: Schema.ObjectId,
    ref: "User",
    required: true,
  },

  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
  },
  likes: [
    {
      type: Schema.ObjectId,
      ref: "User",
    },
  ],
  dislikes: [
    {
      type: Schema.ObjectId,
      ref: "User",
    },
  ],
  answer: [
    {
      type: Schema.ObjectId,
      ref: "Answer",
    },
  ],
  private: {
    type: Boolean,
    default: false,
  },
  selectedMentor: {
    type: Schema.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = model("Question", QuestionSchema);
