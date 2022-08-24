const { model, Schema } = require("mongoose");

const SkillSchema = new Schema({
  jobprofile: {
    type: Schema.ObjectId,
    ref: "jobprofile",
  },
  skillname: {
    type: String,
  },
  verify: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = model("skill", SkillSchema);
