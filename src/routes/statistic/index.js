const express = require("express");
const { authentication, restrictTo } = require("../../auth/authUtils");
const { asyncHandler } = require("../../helpers/asyncHandler");
const StatisticController = require("../../controllers/statistic.controller");
const router = express.Router();
router.use(authentication);
router.get(
  "/revenueofstore",
  asyncHandler(StatisticController.getRevenueOfStore)
);
router.get(
  "/revenueofstorebymonth",
  asyncHandler(StatisticController.getRevenueOfStoreByMonth)
);
router.get(
  "/revenueofstorebyyear",
  asyncHandler(StatisticController.getRevenueOfStoreByYear)
);
module.exports = router;
