const express = require("express");
const { asyncHandler } = require("../../helpers/asyncHandler");
const CategoryController = require("../../controllers/category.controller");
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
router.route("/").get(asyncHandler(CategoryController.findAllCategories));
router.route("/:id").get(asyncHandler(CategoryController.findCategory));
router.use(authentication);
router
  .route("/")
  .post(
    restrictTo("admin"),
    upload.single("image"),
    asyncHandler(CategoryController.createCategory)
  );
router
  .route("/:id")
  .patch(
    restrictTo("admin"),
    upload.single("image"),
    asyncHandler(CategoryController.updateCategory)
  );
module.exports = router;
