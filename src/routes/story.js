const express = require("express");
const { isAuthor } = require("../middleware/imagine");
const { isLoggedIn } = require("../middleware/user");
const { createStory } = require("../controller/storyController");
const router = express.Router();

// private routes
router.route("/storyCreate").post(isLoggedIn, createStory);

module.exports = router;
