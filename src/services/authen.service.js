"use strict";

const {
  BadRequestError,
  InternalServerError,
  AuthFailureError,
} = require("../core/error.response");
const userModel = require("../models/user.model");
const { getInfoData, removeUndefinedInObject } = require("../utils");
const crypto = require("crypto");
const KeyTokenService = require("./keytoken.service");
const { createTokenPair } = require("../auth/authUtils");
const { Types } = require("mongoose");
const Email = require("../utils/email");
const generateOTPConfig = require("../utils/generateOTP.config");
const JWT = require("jsonwebtoken");
const storeModel = require("../models/store.model");
const EXPIRES_TIME = 10 * 60 * 1000;
const TIME = 1000 * 60 * 60 * 2;

class AuthenService {
  static resetPassword = async ({
    body: { password, passwordConfirm },
    params,
  }) => {
    const passwordResetToken = crypto
      .createHash("sha256")
      .update(params.token)
      .digest("hex");
    const user = await userModel.findOne({
      passwordResetToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) {
      throw new BadRequestError("Your token is invalid or has expired.");
    }

    if (password !== passwordConfirm) {
      throw new AuthFailureError("Passwords do not match! Please try again!");
    }

    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    user.password = password;
    await user.save({ validateBeforeSave: false });

    const publicKey = crypto.randomBytes(64).toString("hex");
    const privateKey = crypto.randomBytes(64).toString("hex");

    const keytoken = await KeyTokenService.createKeyToken({
      user: new Types.ObjectId(user._id),
      privateKey,
      publicKey,
    });

    if (!keytoken) {
      throw new BadRequestError("Keytoken Error");
    }

    const tokens = await createTokenPair(
      { userId: user._id, email: user.email, role: user.role },
      publicKey,
      privateKey
    );
    return {
      message: "Reset Password Successfully!",
      metadata: {
        user: getInfoData({ object: user, fields: ["_id", "name", "email"] }),
        tokens,
      },
    };
  };
  // type: forgotPwd, signUp
  static verifyOTP = async ({ type, email, OTP }) => {
    if (!["forgotPwd", "signUp"].includes(type)) {
      throw new BadRequestError("Type is invalid!");
    }
    const user = await userModel.findOne({
      email,
      OTPExpires: { $gt: Date.now() },
    });
    if (!user) {
      throw new BadRequestError(
        "There is no user with email address or OTP has expired!"
      );
    }
    const hashOTP = crypto.createHash("sha256").update(OTP).digest("hex");
    if (user.OTP !== hashOTP) {
      throw new AuthFailureError(
        "Your entered OTP is invalid! Please try again!"
      );
    }

    user.OTP = undefined;
    user.OTPExpires = undefined;
    await user.save({ validateBeforeSave: false });

    if (type === "forgotPwd") {
      const resetToken = crypto.randomBytes(32).toString("hex");

      const passwordResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
      const passwordResetExpires = Date.now() + EXPIRES_TIME; // 10p hiệu lực

      await userModel.findOneAndUpdate(
        { _id: new Types.ObjectId(user._id) },
        { passwordResetToken, passwordResetExpires },
        { new: true }
      );
      return {
        message: "Verify OTP successfully!",
        metadata: {
          resetURL: `http://localhost:${process.env.PORT}/api/v1/resetPassword/${resetToken}`,
        },
      };
    } else if (type === "signUp") {
      if (user?.role === "user") {
        await userModel.findByIdAndUpdate(user._id, { status: "active" });

        if (user) {
          // tạo private key và public key
          const privateKey = crypto.randomBytes(64).toString("hex");
          const publicKey = crypto.randomBytes(64).toString("hex");

          // tạo keytoken model mới
          const newkeytoken = await KeyTokenService.createKeyToken({
            userId: user._id,
            publicKey,
            privateKey,
          });

          if (!newkeytoken) {
            throw new BadRequestError("Keytoken Error");
          }

          const tokens = await createTokenPair(
            { userId: user._id, email, role: user.role },
            publicKey,
            privateKey
          );
          return {
            statusCode: 201,
            message: "Sign up successfully!",
            metadata: {
              user: getInfoData({
                object: user,
                fields: ["_id", "name", "email"],
              }),
              tokens,
            },
          };
        }
        return {
          statusCode: 200,
          metadata: null,
        };
      } else if (user?.role === "vendor") {
        await userModel.findByIdAndUpdate(user._id, { status: "pending" });
        return {
          statusCode: 200,
          message: "Please wait for a response from the admin!",
          metadata: null,
        };
      }
    }
  };
  static forgotPassword = async ({ email }) => {
    const user = await userModel.findOne({ email });
    if (!user) {
      throw new BadRequestError("There is no user with email address!");
    }

    const OTP = generateOTPConfig(4);
    const hashOTP = crypto.createHash("sha256").update(OTP).digest("hex");
    user.OTP = hashOTP;
    user.OTPExpires = Date.now() + EXPIRES_TIME;
    await user.save({ validateBeforeSave: false });
    try {
      await new Email({ type: "forgot", email, OTP }).sendEmail();
    } catch (error) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.save({ validateBeforeSave: false });

      throw new InternalServerError(
        "There was an error sending the email. Try again later!"
      );
    }

    return {
      message: "OTP sent to email!",
    };
  };
  static logOut = async (keyStore) => {
    const delKey = await KeyTokenService.removeKeyById(keyStore._id);
    console.log({ delKey });
    return delKey;
  };
  static signUp = async ({
    name,
    email,
    password,
    passwordConfirm,
    role,
    mobile,
  }) => {
    if (role !== "vendor" && mobile) {
      throw new BadRequestError(
        `${role.toUpperCase()} can not provide mobile when signing up!`
      );
    }
    if (!name || !email || !password || !passwordConfirm) {
      throw new BadRequestError("Error: Please fill all the fields!");
    }
    const existingUser = await userModel
      .findOne({ email, status: "active" })
      .lean();
    if (existingUser) {
      throw new BadRequestError("Error: User already registered!");
    }

    const existingUnverifiedUser = await userModel
      .findOne({ email, status: "unverified" })
      .lean();
    const newUser =
      existingUnverifiedUser ||
      (await userModel.create(
        removeUndefinedInObject({
          name,
          email,
          password,
          passwordConfirm,
          role,
          status: "unverified",
          mobile,
        })
      ));
    const OTP = generateOTPConfig(4);
    const hashOTP = crypto.createHash("sha256").update(OTP).digest("hex");
    newUser.OTP = hashOTP;
    newUser.OTPExpires = Date.now() + EXPIRES_TIME;
    await newUser.save({ validateBeforeSave: false });
    try {
      await new Email({ email, OTP }).sendEmail();
    } catch (err) {
      throw new InternalServerError(
        "There was an error sending the email. Try again later!"
      );
    }

    return {
      message: "OTP sent to email!",
    };
  };

  static logIn = async ({ email, password }) => {
    if (!email || !password) {
      throw new BadRequestError("Error: Please enter email or password!");
    }

    const user = await userModel.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      throw new AuthFailureError("Error: Incorrect email or password!");
    }
    if (user.status === "unverified") {
      throw new AuthFailureError(
        "Error: This account is unverified! Please sign up again!"
      );
    }

    // tạo private key và public key
    const privateKey = crypto.randomBytes(64).toString("hex");
    const publicKey = crypto.randomBytes(64).toString("hex");

    const tokens = await createTokenPair(
      { userId: user._id, email, role: user.role },
      publicKey,
      privateKey
    );
    if (user.role === "vendor") {
      user.stores = await storeModel.find({ vendor: user._id });
    }
    await KeyTokenService.createKeyToken({
      userId: user._id,
      refreshToken: tokens.refreshToken,
      privateKey,
      publicKey,
    });

    return {
      statusCode: 200,
      message: "Log in successfully!",
      metadata: {
        user: removeUndefinedInObject({
          ...getInfoData({
            object: user,
            fields: ["_id", "name", "email", "role", "stores"],
          }),
          status: user.role === "vendor" ? user.status : undefined,
        }),
        tokens,
      },
    };
  };

  static refreshToken = async ({ refreshToken, header_client_id }) => {
    const userId = header_client_id;
    if (!userId) {
      throw new AuthFailureError("Invalid Request!");
    }
    const keyStore = await KeyTokenService.findByUserId(userId);
    if (!keyStore) {
      throw new NotFoundError("Not Found KeyStore!");
    }
    const decodedUser = JWT.verify(refreshToken, keyStore.privateKey);
    if (decodedUser.userId !== userId) {
      throw new AuthFailureError("Invalid UserId");
    }

    const accessToken = await JWT.sign(
      {
        userId: decodedUser.userId,
        email: decodedUser.email,
        role: decodedUser.role,
      },
      keyStore.publicKey,
      {
        // expiresIn: "2 days",
        expiresIn: TIME,
      }
    );

    return { accessToken, timeExpired: Date.now() + TIME * 1000 };
  };
}

module.exports = AuthenService;
