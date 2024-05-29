"use strict";
const { Schema, model } = require("mongoose");
const COLLECTION_NAME = "Vouchers";
const DOCUMENT_NAME = "Voucher";

const voucherSchema = new Schema(
  {
    name: { type: String, required: true },
    value: { type: Number, required: true },
    type: { type: String, default: "fixed_amount" }, // percentage
    code: { type: String, required: true, unique: true },
    minimumPayment: { type: Number, required: true, default: 0},
    expiresAt: { type: Date, required: true },
    image: { type: String },
    description: { type: String },
    store: { type: Schema.Types.ObjectId, ref: "Store" },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    left: { type: Number, default: 0 },
    applies_to: {
      type: String,
      required: true,
      enum: ["all", "specificShops", "allFoodsInShop", "specificFoods"],
    },
    applied_foods: [{ type: Schema.Types.ObjectId, ref: "Food" }],
    applied_stores: [{ type: Schema.Types.ObjectId, ref: "Store" }],
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

//Export the model
module.exports = model(DOCUMENT_NAME, voucherSchema);
