const express = require("express");
const {
  createImagine,
  getImagines,
  getSingleImagine,
  updateImgine,
  deleteImagine,
  appriciate,
  comment,
  deletecomment,
  saveImagines,
  deleteSaveItem,
} = require("../controller/imagineController");
const { isAuthor } = require("../middleware/imagine");
const { isLoggedIn } = require("../middleware/user");
const router = express.Router();

// public routes
router.route("/imagines").get(getImagines);
router.route("/imagines/:id").get(getSingleImagine);

// private routes
router.route("/imagineCreate").post(isLoggedIn, createImagine);
router.route("/imagines/:id").patch(isLoggedIn, isAuthor, updateImgine);
router.route("/imagines/:id").delete(isLoggedIn, isAuthor, deleteImagine);
router.route("/imagines/:id/appriciate").put(isLoggedIn, appriciate);
router.route("/imagines/:id/comment").post(isLoggedIn, comment);
router.route("/imagines/:id/save").put(isLoggedIn, saveImagines);
router.route("/save/:id").delete(isLoggedIn, deleteSaveItem);
router
  .route("/imagines/:id/comment/:comment_id")
  .delete(isLoggedIn, deletecomment);

module.exports = router;
