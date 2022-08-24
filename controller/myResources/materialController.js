const BigPromise = require("../../middleware/bigPromise");

const cloudinary = require("cloudinary");
const User = require("../../models/User");
const StudyMaterial = require("../../models/myResources/StudyMaterial");

// *
exports.createMaterial = BigPromise(async (req, res, next) => {
  let thumbnailFile, materialsrcFile;

  // check if introIMage file exists
  if (req.files) {
    if (req.files.thumbnail) {
      thumbnailFile = await cloudinary.v2.uploader.upload(
        req.files.thumbnail.tempFilePath,
        {
          folder: "studyMaterial",
          crop: "scale",
        }
      );
    }

    // check if introIMage file exists
    if (req.files.materialFile) {
      materialsrcFile = await cloudinary.v2.uploader.upload(
        req.files.materialFile.tempFilePath,
        {
          folder: "studyMaterial",
          crop: "scale",
        }
      );
    }
  }

  if (!req.body.name) {
    return next(new CustomeError("Name is required", 400));
  }

  const thumbnail = thumbnailFile && {
    id: thumbnailFile.public_id,
    secure_url: thumbnailFile.secure_url,
  };

  const materialFile = materialsrcFile && {
    id: materialsrcFile.public_id,
    secure_url: materialsrcFile.secure_url,
  };

  const user = await User.findById(req.user.id);

  (req.body.materialFile = materialFile ? materialFile : null),
    (req.body.thumbnail = thumbnail ? thumbnail : null),
    (req.body.user = user);

  const newMaterial = await StudyMaterial.create(req.body);

  res.status(201).json({
    success: true,
    newMaterial,
  });
});

exports.getMaterials = BigPromise(async (req, res, next) => {
  const materials = await StudyMaterial.find().sort("-createdAt").populate({
    path: "user",
    select:
      "-__v -bio -saveimagines -followers -following -createdAt -imagines",
  }); // most recent

  res.status(200).json({
    success: true,
    materials,
  });
});

// get user materials
exports.getMyMaterials = BigPromise(async (req, res, next) => {
  const materials = await StudyMaterial.find().sort("-createdAt").populate({
    path: "user",
    select:
      "-__v -bio -saveimagines -followers -following -createdAt -imagines",
  }); // most recent

  res.status(200).json({
    success: true,
    materials,
  });
});

// get single material
exports.getSingleMaterial = BigPromise(async (req, res, next) => {
  const singleMaterial = await StudyMaterial.findById(req.params.id).populate({
    path: "user",
    select:
      "-__v -bio -saveimagines -followers -following -createdAt -imagines",
  });

  if (!singleMaterial) {
    return res.status(404).json({ msg: "Material not found" });
  }

  // Imagines.findByIdAndUpdate(req.params.id)

  res.status(200).json({
    success: true,
    singleMaterial,
  });
});

// get user materials
exports.userMaterials = BigPromise(async (req, res, next) => {
  const studyMaterials = await StudyMaterial.find({ user: req.user.id })
    .sort("-createdAt")
    .populate("user", "_id name photo");

  res.json({ studyMaterials });
});

exports.updateMaterial = BigPromise(async (req, res, next) => {
  const material = await StudyMaterial.findById(req.params.id);
  if (!material) {
    return next(new CustomeError("Material doesn't exist", 404));
  }

  // fetching updated details
  let newMaterialForUpdate = req.body;

  if (req.files) {
    // updating intro image
    if (req.files.thumbnail) {
      // delete old image
      await cloudinary.v2.uploader.destroy(material.thumbnail.id);

      // upload new image
      const newThumbnail = await cloudinary.v2.uploader.upload(
        req.files.thumbnail.tempFilePath,
        {
          folder: "studyMaterial",

          crop: "scale",
        }
      );
      // add thumbnail for update
      newMaterialForUpdate.thumbnail = {
        id: newThumbnail.public_id,
        secure_url: newThumbnail.secure_url,
      };
    }

    // updating outro image
    if (req.files.materialFile) {
      // delete old image
      await cloudinary.v2.uploader.destroy(material.materialFile.id);

      // upload new file
      const newMaterialFile = await cloudinary.v2.uploader.upload(
        req.files.materialFile.tempFilePath,
        {
          folder: "studyMaterial",
          crop: "scale",
        }
      );
      // add intro image for update
      newMaterialForUpdate.materialFile = {
        id: newMaterialFile.public_id,
        secure_url: newMaterialFile.secure_url,
      };
    }
  }

  const updatedMaterial = await Imagines.findByIdAndUpdate(
    req.params.id,
    newMaterialForUpdate,
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({ success: true, updatedMaterial });
});

// delete imagine
exports.deleteMaterial = BigPromise(async (req, res, next) => {
  // need imagine which needs to be deleted
  const material = await StudyMaterial.findById(req.params.id);

  if (!material) {
    return next(new CustomeError("Material doesn't exits", 404));
  }

  let thumbnailId, materialfileId;
  // grab intro image and outro image to be deleted if exits
  // check if intro image exists
  if (material?.thumbnail) {
    // grab intro Imageid
    thumbnailId = material?.thumbnail?.id;
  }

  if (material?.materialFile) {
    // grab intro Imageid
    materialfileId = material?.materialFile?.id;
  }

  if (thumbnailId != undefined) {
    // delete intro image id
    await cloudinary.v2.uploader.destroy(thumbnailId);
  }

  if (materialfileId != undefined) {
    // delete intro image id
    await cloudinary.v2.uploader.destroy(materialfileId);
  }

  // delete imagine from databse
  await material.remove();

  res.status(200).json({
    msg: "material deleted",
  });
});

exports.appriciateMaterial = BigPromise(async (req, res, next) => {
  const material = await StudyMaterial.findById(req.params.id);

  if (
    material.appriciates.some(
      (appriciateuser) => appriciateuser.toString() === req.user.id
    )
  ) {
    material.appriciates = material.appriciates.filter(
      (ap) => ap.toString() !== req.user.id
    );
  } else {
    material.appriciates.unshift(req.user.id);
  }

  await material.save();

  res.status(200).json({
    success: true,
    material,
  });
});

// comment create to imagine
exports.commentMaterial = BigPromise(async (req, res, next) => {
  const material = await StudyMaterial.findById(req.params.id);
  const user = await User.findById(req.user.id);

  if (!req.body.textcomment) {
    return next(new CustomError("Comment text is required", 400));
  }

  const newComment = {
    textcomment: req.body.textcomment,
    user,
  };

  material.comments.unshift(newComment);

  await material.save();

  res.status(200).json({
    success: true,
    comments: material.comments,
  });
});

// get comment
exports.getCommentsMaterial = BigPromise(async (req, res, next) => {
  const material = await StudyMaterial.findById(req.params.id);

  return res.json({ comments: material.comments });
});

// delete comment
exports.deletecommentMaterial = BigPromise(async (req, res, next) => {
  const material = await StudyMaterial.findById(req.params.id);

  // grab the comment which needs to be deleted
  const comment = material.comments.find(
    (comment) => comment.id === req.params.comment_id
  );

  if (comment.user.toString() !== req.user.id) {
    return next(new CustomError("user not authorized", 400));
  }

  material.comments = material.comments.filter(
    ({ id }) => id !== req.params.comment_id
  );

  await material.save();

  res.status(200).json({
    success: true,
    comments: material.comments,
  });
});
