const mongoose = require("mongoose");

const feedbackSchema = mongoose.Schema({
  feedbacktext: {
    type: String,
  },
  rating: {
    type: Number,
    default: 0,
    maxlength: [5, "rating should not be more than 5"],
  },
});

module.exports = mongoose.model("Feedback", feedbackSchema);
