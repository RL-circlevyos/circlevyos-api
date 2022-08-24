const { model, Schema } = require("mongoose");

const CounsellingSchema = Schema({
  user: {
    type: Schema.ObjectId,
    ref: "User",
  },
  intereset: {
    type: String,
  },
  wanttobe: {
    type: String,
  },
  currentStatus: {
    type: String,
  },
  class: {
    type: String,
  },
  stream: {
    type: String,
  },
  sem: {
    type: String,
  },
  currentlyWorking: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = model("Counselling", CounsellingSchema);
