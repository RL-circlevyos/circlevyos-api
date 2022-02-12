const mongoose = require("mongoose");

const SeriesPartSchema = await mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  title: {
    type: String,
    required: [true, "Series part required title"],
  },
  content: {
    type: String,
    maxLength: [3000, "content only have 3000 capabilities"],
  },
  seriesImage: {
    id: {
      type: String,
    },
    secure_url: {
      type: String,
    },
  },
  audio: {
    id: {
      type: String,
    },
    secure_url: {
      type: String,
    },
  },
});

module.exports = mongoose.model("SeriesPart", SeriesPartSchema);
