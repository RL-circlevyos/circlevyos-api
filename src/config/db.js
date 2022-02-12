const mongoose = require("mongoose");

const connectWithDb = () => {
  mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(console.log("MongoDb connected ----> success"))
    .catch((err) => {
      console.log(`DB CONNECTION ISSUE`);
      console.log(err);
      process.exit(1);
    });
};

module.exports = connectWithDb;
