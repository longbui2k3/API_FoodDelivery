const express = require("express");
const { asyncHandler } = require("../../helpers/asyncHandler");
const { authentication, restrictTo } = require("../../auth/authUtils");
const VoucherController = require("../../controllers/voucher.controller");
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

router.route("/").get(asyncHandler(VoucherController.getAllVouchers));

router.use(authentication);

router
  .route("/")
  .post(
    restrictTo("vendor", "admin"),
    upload.single("image"),
    asyncHandler(VoucherController.createVoucher)
  );

module.exports = router;
