"use strict";
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const COLLECTION_NAME = "Users";
const DOCUMENT_NAME = "User";
const default_image =
  "https://firebasestorage.googleapis.com/v0/b/ddnangcao-project.appspot.com/o/users%2Fdefault.png?alt=media&token=25343bf9-3975-4f6a-98ae-bec6f469c2b2";
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide your name!"],
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["unverified", "pending", "active", "inactive"],
      default: "unverified",
    },
    role: {
      type: String,
      enum: ["user", "admin", "vendor", "shipper"],
      default: "user",
    },
    avatar: { type: String, default: default_image },
    gender: {
      type: String,
      enum: ["Nam", "Nữ", "Không xác định", ""],
      default: "",
    },
    dateOfBirth: { type: Date, default: null },
    address: { type: String, default: "" },
    mobile: { type: String, default: "" },
    favoriteFoods: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Food" }],
      default: [],
    },
    favoriteStores: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Store" }],
      default: [],
    },
    password: {
      type: String,
      required: [true, "Please provide your password!"],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please provide your password confirm!"],
      validate: {
        validator: function (val) {
          return val === this.password;
        },
        message: "Passwords are not the same!",
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    OTP: String,
    OTPExpires: Date,
    coin: { type: Number, default: 0 },
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
});
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, userSchema);
