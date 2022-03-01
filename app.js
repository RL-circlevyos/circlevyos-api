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
const path = require("path");
const swaggerDocument = YAML.load("./swagger.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// cors
app.use(cors({ credentials: true, origin: process.env.CLIENT_URL }));
const { createProxyMiddleware } = require("http-proxy-middleware");
app.use(
  "/api/v1",
  createProxyMiddleware({
    target: process.env.CLIENT_URL, //original url
    changeOrigin: true,
    //secure: false,
    onProxyRes: function (proxyRes, req, res) {
      proxyRes.headers["Access-Control-Allow-Origin"] = "*";
    },
  })
);

// regular middleare
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.set("trust proxy", 1);
// cookies and file middleare
app.use(cookieParser(process.env.REFRESH_TOKEN_SECRET));
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// morgan middleware
app.use(morgan("tiny"));

// import all routes

const server = http.createServer(app);
const io = new Server(server, {
  cors: { credentials: true, origin: true },
  allowRequest: (req, callback) => {
    // console.log(req.cookies.refreshtoken, "refresh token app.js");

    cookieParser(process.env.REFRESH_TOKEN_SECRET)(req, {}, () => {
      // console.log(req.cookies, "cookies");
      callback(null, req.cookies.refreshtoken);
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
        socket.client.request.cookies.refreshtoken,
        process.env.REFRESH_TOKEN_SECRET
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
app.use("/api/v1", require("./routes/user"));
app.use("/api/v1", require("./routes/imagines"));
app.use("/api/v1", require("./routes/feedback"));
// app.use("/api/v1", story);
//app.use("/api/v1", trending);
//exports.io = io;
// export app

module.exports = { server };
