const { model, Schema } = require("mongoose");

const ActivitySchema = new Schema({
  jobprofile: {
    type: Schema.ObjectId,
    ref: "jobprofile",
  },
  activityname: {
    type: String,
  },
  place: {
    type: String,
  },
  activityDocument: {
    id: {
      type: String,
    },
    secure_url: {
      type: String,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = model("activity", ActivitySchema);
