"use strict";

const express = require("express");
const authen = require("./authen");
const food = require("./food");
const store = require("./store");
const category = require("./category");
const cart = require("./cart");
const user = require("./user");
const order = require("./order");
const comment = require("./comment");
const voucher = require("./voucher");
const foodviewinghistory = require("./foodviewinghistory");
const statistic = require("./statistic");
const router = express.Router();

router.use("/api/v1/store", store);
router.use("/api/v1/category", category);
router.use("/api/v1/food", food);
router.use("/api/v1/cart", cart);
router.use("/api/v1/user", user);
router.use("/api/v1/order", order);
router.use("/api/v1/comment", comment);
router.use("/api/v1/voucher", voucher);
router.use("/api/v1/foodviewinghistory", foodviewinghistory);
router.use("/api/v1/statistic", statistic);
router.use("/api/v1", authen);

module.exports = router;
