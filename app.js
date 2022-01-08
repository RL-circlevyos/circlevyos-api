const express = require("express");
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

// regular middleare
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// cookies and file middleare
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// temp check
app.set("view engine", "ejs");

// morgan middleware
app.use(morgan("tiny"));

// import all routes

const user = require("./routes/user");
const imagine = require("./routes/imagines");

// routes middleware

app.use("/api/v1", user);
app.use("/api/v1", imagine);

// export app
module.exports = app;
