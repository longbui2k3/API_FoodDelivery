"use strict";
const mongoose = require("mongoose");
const COLLECTION_NAME = "FoodViewingHistories";
const DOCUMENT_NAME = "FoodViewingHistory";

const foodViewingHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    viewedFoods: {
      type: [
        {
          type: {
            food: { type: mongoose.Schema.Types.ObjectId, ref: "Food" },
            viewedAt: { type: Date, default: Date.now() },
          },
        },
      ],
      default: [],
    },
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, foodViewingHistorySchema);
