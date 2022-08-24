const BigPromise = require("../../middleware/bigPromise");
const Course = require("../../models/myResources/Course");
const cloudinary = require("cloudinary");
const User = require("../../models/User");
const CourseSection = require("../../models/myResources/CourseSection");
const SectionVideo = require("../../models/myResources/SectionVideo");

// * create course by anyone
exports.createCourse = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!req.body.name) {
    return res.status(400).json({ msg: "Name is required" });
  }
  let thumbnailFile;
  // check if there is any file or not
  if (req.files.thumbnail) {
    thumbnailFile = await cloudinary.v2.uploader.upload(
      req.files.thumbnail.tempFilePath,
      {
        folder: "course",
        crop: "scale",
      }
    );
  }

  const thumbnailIdAndLink = thumbnailFile && {
    id: thumbnailFile.public_id,
    secure_url: thumbnailFile.secure_url,
  };

  req.body.thumbnail = thumbnailIdAndLink ? thumbnailIdAndLink : null;
  req.body.user = user;

  const newCourse = await Course.create(req.body);

  res.status(200).json({
    success: true,
    newCourse,
  });
});

//* after course create =>  create section
exports.createSection = BigPromise(async (req, res, next) => {
  // first find which course this section will be added
  const course = await Course.findById(req.params.courseid);

  if (!req.body.sectionname) {
    return res.status(400).json({ msg: "Section name is required" });
  }

  req.body.course = course;

  const newSection = await CourseSection.create(req.body);

  res.status(200).json({
    success: true,
    newSection,
  });
});

//* after create section create video under section
exports.createvideocourse = BigPromise(async (req, res, next) => {
  const section = await CourseSection.findById(req.params.sectionid);

  let videoFile;
  // check if there is any file or not
  // console.log(req.files.video);

  if (req.files.sectionvideo) {
    videoFile = await cloudinary.v2.uploader.upload(
      req.files.sectionvideo.tempFilePath,
      {
        folder: "course",
        resource_type: "video",
      }
    );
  }

  const videoToUpload = videoFile && {
    id: videoFile.public_id,
    secure_url: videoFile.secure_url,
  };

  req.body.sectionvideo = videoToUpload ? videoToUpload : null;
  req.body.section = section;

  const newVideo = await SectionVideo.create(req.body);

  CourseSection.findByIdAndUpdate(
    req.params.sectionid,
    {
      $push: { videos: newVideo },
    },
    {
      new: true,
    },
    (err, result) => {
      if (err) {
        return res.status(422).json({ msg: err });
      }
    }
  );

  res.status(200).json({
    newVideo,
  });
});

// * read courses
// ! check routes , need query parameter of limit
exports.getAllCourses = BigPromise(async (req, res, next) => {
  const courses = await Course.find()
    .sort("-createdAt")

    .populate({
      path: "user",
      select:
        "-__v -bio -saveimagines -followers -following -createdAt -imagines",
    }); // most recent

  res.status(200).json({
    success: true,
    courses,
  });
});

// * user created courses
exports.getUserCourses = BigPromise(async (req, res, next) => {
  const courses = await Course.find({ user: req.user.id })
    .sort("-createdAt")

    .populate({
      path: "user",
      select:
        "-__v -bio -saveimagines -followers -following -createdAt -imagines",
    }); // most recent

  res.status(200).json({
    success: true,
    courses,
  });
});

// * read section details and video
exports.getSection = BigPromise(async (req, res, next) => {
  const sections = await CourseSection.find({
    course: req.params.courseid,
  })
    .sort("createdAt")
    .populate("videos", "_id videoname sectionvideo");

  res.status(200).json({
    sections,
  });
});

// * read section videos
exports.getVideos = BigPromise(async (req, res, next) => {
  const videos = await SectionVideo.find({ section: req.params.sectionid });

  res.status(200).json({
    videos,
  });
});

exports.getSingleVideo = BigPromise(async (req, res, next) => {
  const singleVideo = await SectionVideo.findById(req.params.id);

  if (!singleVideo) {
    return res.status(200).json({
      msg: "video doesn't exist",
    });
  }

  res.status(200).json({
    success: true,
    singleVideo,
  });
});

// * read single course
exports.getSingleCourse = BigPromise(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate(
    "user",
    "-__v -bio -saveimagines -followers -following -createdAt -imagines"
  );

  if (!course) {
    return res.status(200).json({
      msg: "course doesn't exist",
    });
  }

  res.status(200).json({
    success: true,
    course,
  });
});

// * update course by author
exports.updateCourse = BigPromise(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return res.status(400).json({
      msg: "Course doesn't exits",
    });
  }

  let newCourseForUpdate = req.body;

  if (req.files.thumbnail) {
    // delete old image
    await cloudinary.v2.uploader.destroy(course.thumbnail.id);

    // upload new image
    const newThumbnail = await cloudinary.v2.uploader.upload(
      req.files.thumbnail.tempFilePath,
      {
        folder: "course",
        width: 150,
        crop: "scale",
      }
    );
    // add intro image for update
    newCourseForUpdate.thumbnail = {
      id: newThumbnail.public_id,
      secure_url: newThumbnail.secure_url,
    };
  }

  const updatedCourse = await Course.findByIdAndUpdate(
    req.params.id,
    newCourseForUpdate,
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
    updatedCourse,
  });
});

// * delete course by author
exports.deleteCourse = BigPromise(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return res.status(400).json({
      msg: "Course doesn't exits",
    });
  }

  // delete thumbnail image
  await cloudinary.v2.uploader.destroy(course?.thumbnail?.id);

  await course.remove();

  res.status(200).json({
    msg: "course deleted",
  });
});
