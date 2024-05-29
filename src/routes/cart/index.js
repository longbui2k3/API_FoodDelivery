const express = require("express");
const { asyncHandler } = require("../../helpers/asyncHandler");
const { authentication, restrictTo } = require("../../auth/authUtils");
const CartController = require("../../controllers/cart.controller");

const router = express.Router();
router.use(authentication);
router.route("/").get(restrictTo("user"), asyncHandler(CartController.getCart));
router
  .route("/")
  .post(restrictTo("user"), asyncHandler(CartController.addToCart));
router
  .route("/")
  .delete(restrictTo("user"), asyncHandler(CartController.deleteAllCarts));
router
  .route("/:mode")
  .patch(restrictTo("user"), asyncHandler(CartController.updateNumberCart));

module.exports = router;
