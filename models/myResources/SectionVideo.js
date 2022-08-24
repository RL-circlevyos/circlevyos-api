const { model, Schema } = require("mongoose");

const SectionVideoSchema = new Schema({
  section: {
    type: Schema.ObjectId,
    ref: "CourseSection",
  },
  videoname: {
    type: String,
  },
  sectionvideo: {
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

module.exports = model("Sectionvideo", SectionVideoSchema);
