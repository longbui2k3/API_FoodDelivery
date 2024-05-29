"use strict";

const express = require("express");
const AuthenController = require("../../controllers/authen.controller");
const { asyncHandler } = require("../../helpers/asyncHandler");
const { authentication } = require("../../auth/authUtils");
const router = express.Router();

router.route("/signup").post(asyncHandler(AuthenController.signUp));
router.route("/login").post(asyncHandler(AuthenController.logIn));
router
  .route("/forgotPassword")
  .post(asyncHandler(AuthenController.forgotPassword));
router
  .route("/resetPassword/:token")
  .post(asyncHandler(AuthenController.resetPassword));
router.route("/verify").post(asyncHandler(AuthenController.verifyOTP));
router.route("/refreshToken").post(asyncHandler(AuthenController.refreshToken));
//authentication
router.use(authentication);

////////////////////
router.route("/logout").post(asyncHandler(AuthenController.logOut));

const authen = router;
module.exports = authen;
