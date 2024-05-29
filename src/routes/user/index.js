const express = require("express");
const { asyncHandler } = require("../../helpers/asyncHandler");
const UserController = require("../../controllers/user.controller");
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
router.use(authentication);
router.route("/").get(asyncHandler(UserController.getUserInfo))
router
  .route("/favoriteFood")
  .post(restrictTo("user"), asyncHandler(UserController.addFoodToFavorite));
router
  .route("/favoriteFood")
  .get(restrictTo("user"), asyncHandler(UserController.getFavoriteFoods));
router
  .route("/favoriteFood/:food")
  .delete(restrictTo("user"), asyncHandler(UserController.deleteFavoriteFood));
router
  .route("/favoriteFood/checkIsFavorite/:food")
  .get(restrictTo("user"), asyncHandler(UserController.checkFoodIsFavorite));
router
  .route("/favoriteStore")
  .post(restrictTo("user"), asyncHandler(UserController.addStoreToFavorite));
router
  .route("/favoriteStore")
  .get(restrictTo("user"), asyncHandler(UserController.getFavoriteStores));
router
  .route("/favoriteStore/:store")
  .delete(restrictTo("user"), asyncHandler(UserController.deleteFavoriteStore));
router
  .route("/favoriteStore/checkIsFavorite/:store")
  .get(restrictTo("user"), asyncHandler(UserController.checkStoreIsFavorite));

router
  .route("/pendingvendors")
  .get(restrictTo("admin"), asyncHandler(UserController.getAllPendingVendors));
router
  .route("/status")
  .post(restrictTo("admin"), asyncHandler(UserController.changeStatusOfUser));
router
  .route("/coin")
  .get(restrictTo("user"), asyncHandler(UserController.getCoin));
router
  .route("/profile")
  .patch(upload.single("avatar"), asyncHandler(UserController.updateUserInfo));
router.route("/password").patch(asyncHandler(UserController.updatePassword));
module.exports = router;
