const BigPromise = require("../middleware/bigPromise");
const Story = require("../models/story");
const User = require("../models/User");
const { createImagine } = require("./imagineController");

exports.createStory = BigPromise(async (req, res, next) => {
  let coverImageFile;

  // check if introIMage file exists
  if (req.files) {
    if (req.files.coverImage) {
      coverImageFile = await cloudinary.v2.uploader.upload(
        req.files.coverImage.tempFilePath,
        {
          folder: "story",
          crop: "scale",
        }
      );
    }
  }

  if (!req.body.storyname) {
    return next(new CustomeError("story name is required", 400));
  }

  const coverImage = coverImageFile && {
    id: coverImageFile.public_id,
    secure_url: coverImageFile.secure_url,
  };

  const user = await User.findById(req.user.id);

  (req.body.coverImage = coverImage ? coverImage : null),
    (req.body.user = req.user.id);
  (req.body.name = user.name), (req.body.photo = user.photo.secure_url);

  const story = await Story.create(req.body);

  res.status(201).json({
    success: true,
    story,
  });
});

exports.storyImagineCreate = BigPromise(async (req, res, next) => {
  const story = await Story.findById(req.params.id);

  const imagine = createImagine();

  story.imagines.unshift({ imagines: imagine.newImagine });

  await story.save();
});
