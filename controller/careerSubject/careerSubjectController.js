const CareerSubjectSchema = require("../../models/CareerSubjectSchema");
const SubjectAndSyllabusSchema = require("../../models/SubjectAndSyllabusSchema");
const BigPromise = require("../../middleware/bigPromise");

// create details of career subject and syllabus
exports.createCareerSubjectAndSyllabus = BigPromise(async (req, res, next) => {
  const careerSubjectAndSyllabus = await CareerSubjectSchema.create(req.body);

  res.status(200).json(careerSubjectAndSyllabus);
});

// add subject name
exports.addSubject = BigPromise(async (req, res, next) => {
  // const careerSubjectAndSyllabus = await CareerSubjectSchema.findById(
  //   req.params.sareersubjectid
  // );

  // if (!careerSubjectAndSyllabus) {
  //   res.status(400).json("Not found career subject details");
  // }

  if (!req.body.subjectname) {
    res.status(400).json("Subject name is required");
  }

  const subjectandsyllabus = await SubjectAndSyllabusSchema.create(req.body);

  await CareerSubjectSchema.findOneAndUpdate(
    { _id: req.params.careersubjectid },
    {
      $push: { subjectsandsyllabus: subjectandsyllabus },
    },
    {
      new: true,
    },
    (err, result) => {
      if (err) {
        return res.status(422).json(err);
      }
    }
  );

  res.status(200).json(subjectandsyllabus);
});

// add syllabus -> unit name and content
// todo: add content
exports.addContent = BigPromise((req, res, next) => {});

// get all details
exports.getCareerSubjectAndSyllabusDetails = BigPromise(
  async (req, res, next) => {
    const careerSubjectAndSyllabus = await CareerSubjectSchema.find().populate(
      "subjectsandsyllabus",
      "_id subjectname syllabus"
    );

    res.status(200).json(careerSubjectAndSyllabus);
  }
);

// get user requested career subject and syllabus
exports.getUserReqCareerSubjectAndSyllabusDetails = BigPromise(
  async (req, res, next) => {
    const careerSubjectAndSyllabus = await CareerSubjectSchema.find()
      .where("instituteType")
      .equals(req.query.instituteType)
      .where("affiliate")
      .equals(req.query.affiliate)
      .where("department")
      .equals(req.query.department)
      .where("semester")
      .equals(req.query.semester)

      .populate("subjectsandsyllabus", "_id subjectname syllabus");
    // .exec();

    res.status(200).json(careerSubjectAndSyllabus);
  }
);
