const { Error } = require("mongoose");
const BigPromise = require("../middleware/bigPromise");
const Imagines = require("../models/Imagines");
const Report = require("../models/Report");

exports.report = BigPromise((req, res, next) => {
  const imagine = Imagines.findById(req.params.id);

  if (!imagine) {
    return next(new CustomeError("No imagines found", 404));
  }

  req.body.imagine = imagine;
  const newReport = await Report.create(req.body);

  res.status(201).json({
    success: true,
    newReport,
  });
});
