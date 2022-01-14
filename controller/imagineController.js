const cloudinary = require("cloudinary");
const BigPromise = require("../middleware/bigPromise");
const Imagines = require("../models/Imagines");
const User = require("../models/User");
const CustomError = require("../utils/customError");
const CustomeError = require("../utils/customError");

exports.createImagine = BigPromise(async (req, res, next) => {
  let introImageFile, outroImageFile, audioFile;

  // check if introIMage file exists
  if (req.files) {
    if (req.files.introImage) {
      introImageFile = await cloudinary.v2.uploader.upload(
        req.files.introImage.tempFilePath,
        {
          folder: "imagines",
          crop: "scale",
        }
      );
    }

    // check if introIMage file exists
    if (req.files.outroImage) {
      outroImageFile = await cloudinary.v2.uploader.upload(
        req.files.outroImage.tempFilePath,
        {
          folder: "imagines",
          crop: "scale",
        }
      );
    }

    // 🎵 audio file
    if (req.files.audio) {
      audioFile = await cloudinary.v2.uploader.upload(
        req.files.audio.tempFilePath,
        {
          folder: "imagineAudio",
          crop: "scale",
        }
      );
    }
  }

  if (!req.body.title || !req.body.main) {
    return next(new CustomeError("title and main is required", 400));
  }

  console.log(introImageFile, "intro image file");
  console.log(outroImageFile, "outro image file");

  const introImage = introImageFile && {
    id: introImageFile.public_id,
    secure_url: introImageFile.secure_url,
  };

  const outroImage = outroImageFile && {
    id: outroImageFile.public_id,
    secure_url: outroImageFile.secure_url,
  };

  const audioUploadFile = audioFile && {
    id: audioFile.public_id,
    secure_url: audioFile.secure_url,
  };

  const user = await User.findById(req.user.id);

  console.log(user.name);

  (req.body.introImage = introImage ? introImage : null),
    (req.body.outroImage = outroImage ? outroImage : null),
    (req.body.audio = audioUploadFile ? audioUploadFile : null),
    (req.body.user = user);

  const newImagine = await Imagines.create(req.body);

  res.status(201).json({
    success: true,
    newImagine,
  });
});

exports.getImagines = BigPromise(async (req, res, next) => {
  const imaginesArray = await Imagines.find().sort("-createdAt"); // most recent

  res.status(200).json({
    success: true,
    imaginesArray,
  });
});

exports.getSingleImagine = BigPromise(async (req, res, next) => {
  const singleImagine = await Imagines.findById(req.params.id);

  if (!singleImagine) {
    return res.status(404).json({ msg: "page not found" });
  }

  res.status(200).json({
    success: true,
    singleImagine,
  });
});

exports.updateImgine = BigPromise(async (req, res, next) => {
  const imagine = await Imagines.findById(req.params.id);
  if (!imagine) {
    return next(new CustomeError("No imagines found", 404));
  }

  // fetching updated details
  let newImagineForUpdate = req.body;

  if (imagine.introImage && req.files.introImage) {
    introImageId = imagine.introImage.id;
    // delete old image
    await cloudinary.v2.uploader.destroy(introImageId);

    // now upload new intro image
    const result = await cloudinary.v2.uploader.upload(
      req.files.introImage.tempFilePath,
      {
        folder: "imagines",
        crop: "scale",
      }
    );
  }

  if (imagine.outroImage && req.files.outroImage) {
    outroImageId = imagine.outroImage.id;
    // delete old image
    await cloudinary.v2.uploader.destroy(outroImageId);

    // now upload new intro image
    const result = await cloudinary.v2.uploader.upload(
      req.files.outroImage.tempFilePath,
      {
        folder: "imagines",
        crop: "scale",
      }
    );

    newImagineForUpdate.outroImage = result && {
      id: result.public_id,
      secure_url: result.secure_url,
    };
  }

  const updateImagine = await Imagines.findByIdAndUpdate(
    req.params.id,
    newImagineForUpdate,
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({ success: true, updateImagine });
});

// delete imagine
exports.deleteImagine = BigPromise(async (req, res, next) => {
  // need imagine which needs to be deleted
  const imagine = await Imagines.findById(req.params.id);

  if (!imagine) {
    return next(new CustomeError("No imagines found", 404));
  }

  console.log(imagine?.outroImage);
  let introImageId, outroImageId;
  // grab intro image and outro image to be deleted if exits
  // check if intro image exists
  if (imagine?.introImage) {
    // grab intro Imageid
    introImageId = imagine?.introImage?.id;
  }

  if (imagine?.outroImage) {
    // grab intro Imageid
    outroImageId = imagine?.outroImage?.id;
  }

  if (introImageId != undefined) {
    // delete intro image id
    await cloudinary.v2.uploader.destroy(introImageId);
  }

  if (outroImageId != undefined) {
    // delete intro image id
    await cloudinary.v2.uploader.destroy(outroImageId);
  }

  // delete imagine from databse
  await imagine.remove();

  res.status(200).json({
    msg: "imagine deleted",
  });
});

// appriciate imagine
exports.appriciate = BigPromise(async (req, res, next) => {
  const imagine = await Imagines.findById(req.params.id);

  if (
    imagine.appriciates.some(
      (appriciate) => appriciate.user.toString() === req.user.id
    )
  ) {
    imagine.appriciates = imagine.appriciates.filter(
      ({ user }) => user.toString() !== req.user.id
    );
  } else {
    imagine.appriciates.unshift({ user: req.user.id });
  }

  await imagine.save();

  return res.status(200).json(imagine.appriciates);
});

// comment create to imagine
exports.comment = BigPromise(async (req, res, next) => {
  const imagine = await Imagines.findById(req.params.id);
  const user = await User.findById(req.user.id);

  if (!req.body.textcomment) {
    return next(new CustomError("Comment text is required", 400));
  }

  const newComment = {
    textcomment: req.body.textcomment,
    name: user.name,
    photo: user.photo,
    user: req.user.id,
  };

  imagine.comments.unshift(newComment);

  await imagine.save();

  res.status(200).json({
    success: true,
    comments: imagine.comments,
  });
});

// delete comment
exports.deletecomment = BigPromise(async (req, res, next) => {
  const imagine = await Imagines.findById(req.params.id);

  // grab the comment which needs to be deleted
  const comment = imagine.comments.find(
    (comment) => comment.id === req.params.comment_id
  );

  if (comment.user.toString() !== req.user.id) {
    return next(new CustomError("user not authorized", 400));
  }

  imagine.comments = imagine.comments.filter(
    ({ id }) => id !== req.params.comment_id
  );

  await imagine.save();

  res.status(200).json({
    success: true,
    comments: imagine.comments,
  });
});

// save imagine
exports.saveImagines = BigPromise(async (req, res, next) => {
  const imagine = await Imagines.findById(req.params.id);
  const user = await User.findById(req.user.id);

  if (user.saveimagines.imagineid !== imagine.id) {
    const saveItem = {
      imagineid: imagine.id,
      title: imagine.title,
      name: imagine.name,
      photo: imagine.photo,
    };

    user.saveimagines.unshift(saveItem);
  } else {
    res.status(404).json({
      msg: "already saved",
    });
  }

  await user.save();

  res.status(200).json({
    success: true,
    saveimagines: user.saveimagines,
  });
});

// delete save imagine
exports.deleteSaveItem = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  user.saveimagines = user.saveimagines.filter(
    ({ id }) => id !== req.params.id
  );

  await user.save();

  res.status(200).json({
    success: true,
    savedImagines: user.saveimagines,
  });
});
