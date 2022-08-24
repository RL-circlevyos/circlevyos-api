const express = require("express");
const cors = require("cors");
require("dotenv").config();
const shortid = require("shortid");

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
const Razorpay = require("razorpay");

// cors
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 200,
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
      console.log(req.cookies.refreshtoken, "refresh token");
      callback(null, req.cookies.refreshtoken);
    });
  },
  allowUpgrades: true,
});

const razorpay = new Razorpay({
  key_id: "rzp_test_Z6BZ0kXlJJphbP",
  key_secret: "0ci4sIKx4NlV0f2nZhSmOAQj",
});

app.post("/api/v1/verification", (req, res) => {
  // do a validation
  const secret = "12345678";

  console.log(req.body);

  const crypto = require("crypto");

  const shasum = crypto.createHmac("sha256", secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");

  console.log(digest, req.headers["x-razorpay-signature"]);

  if (digest === req.headers["x-razorpay-signature"]) {
    console.log("request is legit");
    // process it
    require("fs").writeFileSync(
      "payment1.json",
      JSON.stringify(req.body, null, 4)
    );
  } else {
    // pass it
  }
  res.json({ status: "ok" });
});

app.post("/api/v1/razorpay", async (req, res) => {
  const payment_capture = 1;
  const amount = 7;
  const currency = "INR";

  const options = {
    amount: amount * 100,
    currency,
    receipt: shortid.generate(),
    payment_capture,
  };

  try {
    const response = await razorpay.orders.create(options);
    console.log(response);
    res.json({
      id: response.id,
      currency: response.currency,
      amount: response.amount,
    });
  } catch (error) {
    console.log(error);
  }
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
app.use("/api/v1", require("./routes/question"));
app.use("/api/v1", require("./routes/myResources"));
app.use("/api/v1", require("./routes/job"));
app.use("/api/v1", require("./routes/career"));
// app.use("/api/v1", story);
//app.use("/api/v1", trending);
//exports.io = io;

// enabling pre-flight
// app.options(
//   "*",
//   cors({
//     origin: "*",
//     credentials: true,
//     methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//     allowedHeaders: ["Content-Type"],
//   })
// );

// export app

module.exports = { server };
