const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const http = require("http");
const { Server } = require("socket.io");
const connectWithDb = require("./config/db");
const cloudinary = require("cloudinary");
const serverless = require("serverless-http");

// documentation imports
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
require("dotenv").config();
// cors
app.use(cors({ credentials: true, origin: true }));

// regular middleare
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.set("trust proxy", 1);
// cookies and file middleare
app.use(cookieParser(process.env.JWT_SECRET));
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// morgan middleware
app.use(morgan("tiny"));

// connect with databse
connectWithDb();

// cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// import all routes

const server = http.createServer(app);
const io = new Server(server, {
  cors: { credentials: true, origin: true },
  allowRequest: (req, callback) => {
    cookieParser(process.env.JWT_SECRET)(req, {}, () => {
      callback(null, req.cookies.token);
    });
  },
  allowUpgrades: true,
});

// socket middleware
app.use((req, res, next) => {
  res.io = io;
  next();
});

io.on("connection", (socket) => {
  console.log("user connected");
  socket.on("message", async (message) => {
    try {
      const decoded = jwt.verify(
        socket.client.request.cookies.token,
        process.env.JWT_SECRET
      );

      // await socket.join(decoded.id);
    } catch (error) {
      console.log(error);
    }
  });
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});
//const user = require("./routes/user");
//const imagine = require("./routes/imagines");
// const story = require("./routes/story");
//const trending = require("./routes/trending");
//const BigPromise = require("./middleware/bigPromise");

// routes middleware
// app.use("/api/v1", require("./routes/user"));
// app.use("/api/v1", require("./routes/imagines"));
// app.use("/api/v1", require("./routes/feedback"));

// netlify
app.use("/.netlify/functions/api", require("./routes/user"));
app.use("/.netlify/functions/api", require("./routes/imagines"));
app.use("/.netlify/functions/api", require("./routes/feedback"));
// app.use("/api/v1", story);
//app.use("/api/v1", trending);
//exports.io = io;
// export app

// module.exports = { server };
module.exports.handler = serverless(app);
