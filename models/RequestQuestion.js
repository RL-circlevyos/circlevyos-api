const { model, Schema } = require("mongoose");

const RequestQuestionSchema = Schema({
  user: {
    type: Schema.ObjectId,
    ref: "User",
  },
  question: {
    type: Schema.ObjectId,
    ref: "Question",
  },
  answer: {
    type: Schema.ObjectId,
    ref: "Answer",
  },
  requestedUser: {
    type: Schema.ObjectId,
    ref: "User",
  },
});

module.exports = model("RequestQuestion", RequestQuestionSchema);
