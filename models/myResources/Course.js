const { Schema, model } = require("mongoose");

const CourseSchema = Schema({
  user: {
    type: Schema.ObjectId,
    ref: "User",
  },
  name: {
    type: String,
    required: [true, "Course Name is required"],
  },
  details: {
    type: String,
  },

  thumbnail: {
    id: {
      type: String,
    },
    secure_url: {
      type: String,
    },
  },
  section: [
    {
      type: Schema.ObjectId,
      ref: "CourseSection",
    },
  ],
  price: {
    type: String,
    default: "free",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = model("Course", CourseSchema);
