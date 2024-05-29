const express = require("express");
const { asyncHandler } = require("../../helpers/asyncHandler");
const CommentController = require("../../controllers/comment.controller");
const { authentication, restrictTo } = require("../../auth/authUtils");
const multer = require("multer");
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: function (req, file, callback) {
    // Allowed file types
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

    if (allowedTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      throw new BadRequestError(
        "Only .png, .jpg, .jpeg, .webp files are allowed."
      );
    }
  },
});
const router = express.Router();

router.route("/").get(asyncHandler(CommentController.getAllComments));
router.use(authentication);
router
  .route("/")
  .post(restrictTo("user"),upload.any(),asyncHandler(CommentController.createComment));
router
  .route("/:id")
  .delete(restrictTo("user"), asyncHandler(CommentController.removeComment));
router
  .route("/:comment/like")
  .patch(restrictTo("user"), asyncHandler(CommentController.likeComment));
router
  .route("/:comment/unlike")
  .patch(restrictTo("user"), asyncHandler(CommentController.unlikeComment));
router
  .route("/:comment/checkUserLiked")
  .get(restrictTo("user"), asyncHandler(CommentController.checkUserLiked));
module.exports = router;
