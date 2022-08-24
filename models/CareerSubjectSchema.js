const { model, Schema } = require("mongoose");

const CareerSubjectSchema = new Schema({
  instituteType: {
    type: String,
    enum: ["college", "school"],
  },
  affiliate: {
    type: String,
  },
  department: {
    type: String,
  },
  semester: {
    type: String,
  },
  subjectsandsyllabus: [
    {
      type: Schema.ObjectId,
      ref: "subjectandsyllabus",
    },
  ],
});

module.exports = model("careersubject", CareerSubjectSchema);
