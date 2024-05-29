"use strict";

const { SuccessResponse, OK } = require("../core/success.response");
const AuthenService = require("../services/authen.service");
const HEADER = {
  API_KEY: "x-api-key",
  CLIENT_ID: "x-client-id",
  AUTHORIZATION: "authorization",
  REFRESHTOKEN: "x-rtoken-id",
};
class AuthenController {
  resetPassword = async (req, res, next) => {
    const result = await AuthenService.resetPassword(req);
    return new OK(result).send(res);
  };
  verifyOTP = async (req, res, next) => {
    const result = await AuthenService.verifyOTP({
      type: req.query.type,
      ...req.body,
    });
    return new OK(result).send(res);
  };
  forgotPassword = async (req, res, next) => {
    const result = await AuthenService.forgotPassword(req.body);
    return new OK(result).send(res);
  };
  logOut = async (req, res, next) => {
    const result = await AuthenService.logOut(req.keyStore);
    return new SuccessResponse(result).send(res);
  };
  signUp = async (req, res, next) => {
    console.log("[P]::signUp::", req.body);

    const result = await AuthenService.signUp(req.body);
    return new SuccessResponse(result).send(res);
  };
  logIn = async (req, res, next) => {
    console.log("[P]::logIn::", req.body);

    const result = await AuthenService.logIn(req.body);
    return new SuccessResponse(result).send(res);
  };
  refreshToken = async (req, res, next) => {
    const tokens = await AuthenService.refreshToken({
      refreshToken: req.body.refreshToken,
      header_client_id: req.headers[HEADER.CLIENT_ID],
    });
    return new SuccessResponse({
      message: "Refresh access token successfully!",
      metadata: {
        tokens,
      },
    }).send(res);
  };
}

module.exports = new AuthenController();
