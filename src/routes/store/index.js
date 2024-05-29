const express = require("express");
const { asyncHandler } = require("../../helpers/asyncHandler");
const StoreController = require("../../controllers/store.controller");
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
router.route("/").get(asyncHandler(StoreController.findAllStores));
router
  .route("/vendor")
  .get(
    authentication,
    restrictTo("vendor"),
    asyncHandler(StoreController.findAllStoresByVendor)
  );
router
  .route("/top10rating")
  .get(asyncHandler(StoreController.findTop10RatingStores));
router.route("/:id").get(asyncHandler(StoreController.findStore));
router.use(authentication);
router
  .route("/")
  .post(upload.single("image"), asyncHandler(StoreController.createStore));
router
  .route("/:id")
  .patch(
    upload.single("image"),
    authentication,
    restrictTo("vendor"),
    asyncHandler(StoreController.updateStore)
  );
module.exports = router;
