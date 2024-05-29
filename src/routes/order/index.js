const express = require("express");
const { asyncHandler } = require("../../helpers/asyncHandler");
const OrderController = require("../../controllers/order.controller");
const { authentication, restrictTo } = require("../../auth/authUtils");

const router = express.Router();

router.use(authentication);
router
  .route("/")
  .post(restrictTo("user"), asyncHandler(OrderController.createOrder));
router
  .route("/vendor")
  .get(
    restrictTo("vendor"),
    asyncHandler(OrderController.findAllOrdersForVendor)
  );
router
  .route("/user")
  .get(restrictTo("user"), asyncHandler(OrderController.findAllOrdersForUser));
router
  .route("/shipper")
  .get(
    restrictTo("shipper"),
    asyncHandler(OrderController.findAllOrdersForShipper)
  );
router
  .route("/:id")
  .patch(
    restrictTo("user", "vendor", "shipper"),
    asyncHandler(OrderController.updateStatusOrders)
  );

module.exports = router;
