const express = require("express");
const { asyncHandler } = require("../../helpers/asyncHandler");
const FoodController = require("../../controllers/food.controller");
const { authentication, restrictTo } = require("../../auth/authUtils");
const multer = require("multer");
const { BadRequestError } = require("../../core/error.response");
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

router.route("/").get(asyncHandler(FoodController.findAllFoods));
router
  .route("/:id")
  .get(asyncHandler(FoodController.findFood))
  .patch(upload.single("image"), asyncHandler(FoodController.updateFood));
router.use(authentication);
router.route("/").post(
  // restrictTo("admin"),
  upload.single("image"),
  asyncHandler(FoodController.createFood)
);
module.exports = router;
