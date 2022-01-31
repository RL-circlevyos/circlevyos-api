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
    if (req.files.audiovoice) {
      audioFile = await cloudinary.v2.uploader.upload(
        req.files.audiovoice.tempFilePath,
        {
          folder: "imagines",
          resource_type: "auto",
        }
      );
    }
  }

  if (!req.body.title || !req.body.main) {
    return next(new CustomeError("title and main is required", 400));
  }

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
    (req.body.audiovoice = audioUploadFile ? audioUploadFile : null),
    (req.body.user = user);

  const newImagine = await Imagines.create(req.body);

  res.io.emit("create-imagine");

  res.status(201).json({
    success: true,
    newImagine,
  });
});

exports.getImagines = BigPromise(async (req, res, next) => {
  // find user's followings
  // then extract followings user's posts
  // const followings = await User.findById(req.query.id).populate(
  //   "following",
  //   "_id name imagines"
  // );

  // console.log(followings);

  const limitVal = 20;
  const skipVal = limitVal * req.query.skipCount;
  const imaginesArray = await Imagines.find()
    .sort("-createdAt")
    .limit(limitVal)
    .skip(skipVal)
    .populate({
      path: "user",
      select:
        "-__v -bio -saveimagines -followers -following -createdAt -imagines",
    }); // most recent

  res.status(200).json({
    success: true,
    imaginesArray,
  });
});

exports.getSingleImagine = BigPromise(async (req, res, next) => {
  const singleImagine = await Imagines.findById(req.params.id).populate({
    path: "user",
    select:
      "-__v -bio -saveimagines -followers -following -createdAt -imagines",
  });

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

  // if (imagine.introImage && req.files.introImage) {
  //   introImageId = imagine.introImage.id;
  //   // delete old image
  //   await cloudinary.v2.uploader.destroy(introImageId);

  //   // now upload new intro image
  //   const result = await cloudinary.v2.uploader.upload(
  //     req.files.introImage.tempFilePath,
  //     {
  //       folder: "imagines",
  //       crop: "scale",
  //     }
  //   );
  // }

  // if (imagine.outroImage && req.files.outroImage) {
  //   outroImageId = imagine.outroImage.id;
  //   // delete old image
  //   await cloudinary.v2.uploader.destroy(outroImageId);

  //   // now upload new intro image
  //   const result = await cloudinary.v2.uploader.upload(
  //     req.files.outroImage.tempFilePath,
  //     {
  //       folder: "imagines",
  //       crop: "scale",
  //     }
  //   );

  //   newImagineForUpdate.outroImage = result && {
  //     id: result.public_id,
  //     secure_url: result.secure_url,
  //   };
  // }

  const updateImagine = await Imagines.findByIdAndUpdate(
    req.params.id,
    newImagineForUpdate,
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );
  res.io.emit("update-imagine");
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

  res.io.emit("delete-imagine");
  res.status(200).json({
    msg: "imagine deleted",
  });
});

// appriciate
exports.appriciate = BigPromise(async (req, res, next) => {
  const imagine = await Imagines.findById(req.params.id);

  if (
    imagine.appriciates.some(
      (appriciate) => appriciate.toString() === req.user.id
    )
  ) {
    imagine.appriciates = imagine.appriciates.filter(
      (ap) => ap.toString() !== req.user.id
    );
  } else {
    imagine.appriciates.unshift(req.user.id);
  }

  await imagine.save();
  res.io.emit("appriciate", imagine.appriciates);
  return res.status(200).json(imagine.appriciates);
});

exports.appriciateList = BigPromise(async (req, res, next) => {
  const singleImagine = await Imagines.findById(req.params.id).populate(
    "appriciates",
    "_id name photo"
  );
  // const appriciates = singleImagine.appriciates
  return res.status(200).json(singleImagine);
});

// appriciate id list
exports.appriciateIdList = BigPromise(async (req, res, next) => {
  const singleImagine = await Imagines.findById(req.params.id);
  // const appriciates = singleImagine.appriciates
  if (!singleImagine) {
    return next(new CustomError("No such imagine exists"));
  }
  return res.status(200).json(singleImagine.appriciates);
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
  res.io.emit("create-comment");
  res.status(200).json({
    success: true,
    comments: imagine.comments,
  });
});

// get comment
exports.getComments = BigPromise(async (req, res, next) => {
  const imagines = await Imagines.findById(req.params.id);

  return res.json({ comments: imagines.comments });
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

  res.io.emit("delete-comment");
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
      imagine: imagine,
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
