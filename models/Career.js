const { model, Schema } = require("mongoose");

const CareerSchema = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: "user",
  },
  currentstatus: {
    type: String,
    enum: ["school", "college", "injob"],
  },
  institutename: {
    type: String,
  },
  stream: {
    type: String,
  },
  semester: {
    type: String,
  },
  affiliates: {
    type: String,
  },
  department: {
    type: String,
  },
});

module.exports = model("career", CareerSchema);
