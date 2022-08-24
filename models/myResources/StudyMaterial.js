const { Schema, model } = require("mongoose");

const StudyMaterialSchema = Schema({
  user: {
    type: Schema.ObjectId,
    ref: "User",
  },
  name: {
    type: String,
    required: [true, "Material Name is required"],
  },
  details: {
    type: String,
  },
  materialFile: {
    id: {
      type: String,
    },
    secure_url: {
      type: String,
    },
  },
  thumbnail: {
    id: {
      type: String,
    },
    secure_url: {
      type: String,
    },
  },
  price: {
    type: String,
    default: "free",
  },
  appriciates: [
    {
      type: Schema.ObjectId,
      ref: "User",
    },
  ],
  comments: [
    {
      user: {
        type: Schema.ObjectId,
        ref: "User",
        required: true,
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

module.exports = model("StudyMaterial", StudyMaterialSchema);
