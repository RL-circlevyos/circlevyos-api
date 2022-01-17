const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");

// documentation imports
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// cors
app.use(cors({ credentials: true, origin: true }));

// regular middleare
app.use(express.json());
app.use((req, res, next) => {
  // res.header("Access-Control-Allow-Credentials", true);
  res.header(
    "Access-Control-Allow-Methods",
    "GET,PUT,POST,DELETE,UPDATE,OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept"
  );
  next();
});

app.use(express.urlencoded({ extended: true }));
// app.set("trust proxy", 1);
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

// routes middleware
app.use("/api/v1", user);
app.use("/api/v1", imagine);
// app.use("/api/v1", story);
app.use("/api/v1", trending);

// export app
module.exports = app;
