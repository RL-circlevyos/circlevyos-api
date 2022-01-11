const mongoose = require("mongoose");

const StorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
  },
  photo: {
    type: String,
  },
  storyname: {
    type: String,
    required: [true, "Title is required"],
  },
  description: {
    type: String,
  },
  coverImage: {
    id: {
      type: String,
    },
    secure_url: {
      type: String,
    },
  },
  category: {
    type: String,
    required: [true, "please select category from only technology, react "],
    enum: {
      values: ["technology", "react"],
      message: "please select category from only technology, react ",
    },
  },
  appriciates: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    },
  ],
  comments: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
      },
      photo: {
        type: String,
      },
      textcomment: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  imagines: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Imagine",
    },
  ],
  publish: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Story", StorySchema);
