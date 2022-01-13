const mongoose = require("mongoose");

const TrendingSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  coverImage: {
    type: String,
  },
  series: {
    type: Boolean,
  },
});

module.exports = mongoose.model("Trending", TrendingSchema);
