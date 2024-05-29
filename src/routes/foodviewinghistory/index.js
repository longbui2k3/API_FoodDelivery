const express = require("express");
const { asyncHandler } = require("../../helpers/asyncHandler");
const { authentication, restrictTo } = require("../../auth/authUtils");
const FoodViewingHistoryController = require("../../controllers/foodviewinghistory.controller");
const router = express.Router();
router.use(authentication);
router
  .route("/viewedfood")
  .patch(
    restrictTo("user"),
    asyncHandler(FoodViewingHistoryController.addFoodToHistory)
  );
router
  .route("/user")
  .get(
    restrictTo("user"),
    asyncHandler(FoodViewingHistoryController.getFoodsInHistory)
  );

module.exports = router;
