const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
  imagine: {
    type: mongoose.Schema.ObjectId,
    ref: "Imagine",
  },
  text: {
    type: String,
    required: true,
  },
});

mongoose.exports = mongoose.Model("Report", ReportSchema);
