const { model, Schema } = require("mongoose");

const SkillSchema = new Schema({
  skillname: {
    type: String,
  },
  verified: {
    type: Boolean,
    default: false,
  },
});

module.exports = model("userskill", SkillSchema);
