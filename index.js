const { server } = require("./app");
const connectWithDb = require("./config/db");
require("dotenv").config();
const cloudinary = require("cloudinary");
const http = require("http");

// connect with databse
connectWithDb();

// cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

PORT = process.env.PORT;

server.listen(process.env.PORT, () => {
  console.log(`server running on  port ${process.env.PORT}`);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM RECEIVED, SHUTTING GRACEFULLY");
  server.close(() => {
    console.log("process terminated");
  });
});

function startKeepAlive() {
  setInterval(function () {
    var options = {
      host: "https://circlevyos-api-prod.herokuapp.com",
      port: 80,
      path: "/",
    };
    http
      .get(options, function (res) {
        res.on("data", function (chunk) {
          try {
            // optional logging... disable after it's working
            console.log("HEROKU RESPONSE: " + chunk);
          } catch (err) {
            console.log(err.message);
          }
        });
      })
      .on("error", function (err) {
        console.log("Error: " + err.message);
      });
  }, 20 * 60 * 1000); // load every 20 minutes
}

startKeepAlive();
