const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const http = require("http");
const { Server } = require("socket.io");

// documentation imports
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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

// import all routes

const user = require("./routes/user");
const imagine = require("./routes/imagines");
// const story = require("./routes/story");
const trending = require("./routes/trending");
const BigPromise = require("./middleware/bigPromise");

// routes middleware
app.use("/api/v1", user);
app.use("/api/v1", imagine);
// app.use("/api/v1", story);
app.use("/api/v1", trending);

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

exports.io = io;
// export app
module.exports = server;
