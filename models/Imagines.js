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
  audiovoice: {
    id: {
      type: String,
    },
    secure_url: {
      type: String,
    },
  },
  reports: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Report",
    },
  ],
  category: [
    {
      type: String,
    },
  ],
  appriciates: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
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
  views: {
    type: Number,
    default: 0,
  },
  background: {
    type: String,
  },
  textcolor: {
    type: String,
  },
  imaginetype: {
    type: String,
  },
  reports: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
      },

      textreport: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

module.exports = mongoose.model("Imagine", ImagineSchema);
