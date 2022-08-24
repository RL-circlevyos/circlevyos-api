const { model, Schema } = require("mongoose");

const SubjectAndSyllabusSchema = new Schema({
  subjectname: {
    type: String,
  },
  syllabus: [
    {
      unit: {
        type: String,
      },
      content: {
        type: String,
      },
    },
  ],
});

module.exports = model("subjectandsyllabus", SubjectAndSyllabusSchema);
