const mongoose = require("mongoose");

const ImagineSchema = new mongoose.Schema({
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
  title: {
    type: String,
    required: [true, "Title is required"],
  },
  intro: {
    type: String,
  },
  introImage: {
    id: {
      type: String,
    },
    secure_url: {
      type: String,
    },
  },
  main: {
    type: String,
    required: [true, "need content of imagines"],
  },
  outro: {
    type: String,
  },
  outroImage: {
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Imagine", ImagineSchema);
