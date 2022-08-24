const User = require("../../models/User");
const BigPromise = require("../../middleware/bigPromise");
const Book = require("../../models/myResources/Book");

// * create book by admin
exports.createBook = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!req.body.name) {
    return res.status(400).json({ msg: "Name is required" });
  }

  req.body.user = user;

  const newBook = await Book.create(req.body);

  res.status(200).json({
    success: true,
    newBook,
  });
});

// * books read by anyone
exports.getAllBooks = BigPromise(async (req, res, next) => {
  const books = await Book.find().sort("-createdAt").populate({
    path: "user",
    select:
      "-__v -bio -saveimagines -followers -following -createdAt -imagines",
  }); // most recent

  res.status(200).json({
    success: true,
    books,
  });
});

// * exam item ready by anyone
exports.getSingleBook = BigPromise(async (req, res, next) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    return res.status(200).json({
      msg: "Book doesn't exist",
    });
  }

  res.status(200).json({
    success: true,
    book,
  });
});

// * update course by admin and organization
exports.updateBook = BigPromise(async (req, res, next) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    return res.status(400).json({
      msg: "Book doesn't exits",
    });
  }

  let newBookForUpdate = req.body;

  const updatedBook = await Book.findByIdAndUpdate(
    req.params.id,
    newBookForUpdate,
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
    updatedBook,
  });
});

// * delete course by author
exports.deleteBook = BigPromise(async (req, res, next) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    return res.status(400).json({
      msg: "book doesn't exits",
    });
  }

  await book.remove();

  res.status(200).json({
    msg: "book deleted",
  });
});
