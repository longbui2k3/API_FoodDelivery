"use strict";
const { Schema, model } = require("mongoose");
const COLLECTION_NAME = "Carts";
const DOCUMENT_NAME = "Cart";

const cartSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    food: { type: Schema.Types.ObjectId, ref: "Food", required: true },
    store: { type: Schema.Types.ObjectId, ref: "Store", required: true },
    number: {
      type: Number,
      required: true,
      default: 1,
      validate: {
        validator: function (num) {
          return num > 0;
        },
        message: "Number must be above or equal 0!",
      },
    },
  },
  { timestamps: true, collection: COLLECTION_NAME }
);
cartSchema.post("aggregate", function (docs) {
  docs.forEach((doc) => {
    doc["store"]["rating"] = doc["store"]["rating"].toFixed(1);
  });
  return docs;
});

//Export the model
module.exports = model(DOCUMENT_NAME, cartSchema);
