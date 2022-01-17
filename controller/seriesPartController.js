const Seriespart = require("../models/Seriespart");
const Story = require("../models/Story");
const User = require("../models/User");
const CustomError = require("../utils/customError");

exports.seriesPartCreate = BigPromise(async (req, res, next) => {
  let seriesImageFile, audioFileUpload;

  // each series part requires story id based on
  // story id series will be pushed to array
  const story = await Story.findById(req.params.id);

  // if there is any files add
  if (req.files) {
    if (req.files.seriesImage) {
      seriesImageFile = await cloudinary.v2.uploader.upload(
        req.files.seriesImage.tempFilePath,
        {
          folder: "series",
          crop: "scale",
        }
      );
    }

    if (req.files.audio) {
      audioFileUpload = await cloudinary.v2.uploader.upload(
        req.files.audio.tempFilePath,
        {
          folder: "seriesAudio",
        }
      );
    }
  }

  if (!req.body.title) {
    return next(new CustomError("title is required"));
  }

  const seriesImage = seriesImageFile && {
    id: seriesImageFile.public_id,
    secure_url: seriesImageFile.secure_url,
  };

  const audio = audioFileUpload && {
    id: audioFile.public_id,
    secure_url: audioFile.secure_url,
  };

  const user = await User.findById(req.user.id);

  req.body.seriesImage = seriesImage ? seriesImage : null;
  req.body.audio = audio ? audio : null;
  req.body.user = user;

  // new series is created
  const newSeries = await Seriespart.create(req.body);

  // now add new series to story
  story.seriesparts.save(newSeries);

  res.status(200).json({
    story,
  });
});
