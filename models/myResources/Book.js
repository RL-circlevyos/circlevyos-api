const { Schema, model } = require("mongoose");

const BookSchema = Schema({
  author: {
    type: String,
  },
  name: {
    type: String,
    required: [true, "Book Name is required"],
  },
  details: {
    type: String,
  },
  link: {
    type: String,
  },
  coverimage: {
    id: {
      type: String,
    },
    secure_url: {
      type: String,
    },
  },
  price: {
    type: String,
    default: "free",
  },
  edition: {
    type: String,
  },
});

module.exports = model("Book", BookSchema);
