const BigPromise = require("../middleware/bigPromise");
const Imagines = require("../models/Imagines");
const Trending = require("../models/Trending");

exports.trending = BigPromise(async (req, res, next) => {
  const imagine = await Imagines.find({
    appriciates: { $size: { $gt: 1 } },
  });

  res.status(200).json({
    imagine,
  });
});
