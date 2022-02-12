const express = require("express");
const { trending } = require("../controller/trendingController");
const { isLoggedIn } = require("../middleware/user");
const router = express.Router();

router.route("/trending").get(isLoggedIn, trending);

module.exports = router;
