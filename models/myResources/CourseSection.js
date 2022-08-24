const { Schema, model } = require("mongoose");

const CourseSectionSchema = new Schema({
  course: {
    type: Schema.ObjectId,
    ref: "Course",
  },
  sectionname: {
    type: String,
  },
  videos: [
    {
      type: Schema.ObjectId,
      ref: "Sectionvideo",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = model("CourseSection", CourseSectionSchema);
