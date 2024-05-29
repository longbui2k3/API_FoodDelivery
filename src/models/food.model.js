"use strict";
const { Schema, model } = require("mongoose");
const COLLECTION_NAME = "Foods";
const DOCUMENT_NAME = "Food";
const default_image =
  "https://firebasestorage.googleapis.com/v0/b/ddnangcao-project.appspot.com/o/foods%2Fdefault.jpg?alt=media&token=9853e20c-19a6-4091-8ec2-e56032043914";
const foodSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please fill in the name of the product!"],
    },
    image: { type: String, default: default_image },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Please fill in the category of the product!"],
    },
    store: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: [true, "Please fill in the store of the product!"],
    },
    price: {
      type: Number,
      required: [true, "Please fill in the price of the product!"],
    },
    rating: {
      type: Schema.Types.Number,
      min: [1, "Rating must be above or equal 1"],
      max: [5, "Rating must be below or equal 5"],
      default: 1.0,
    },
    left: {
      type: Number,
      required: [true, "Please fill in left of the product!"],
    },
    sold: { type: Number, default: 0 },
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

foodSchema.post("find", function (docs) {
  docs.forEach((doc) => {
    doc["rating"] = doc["rating"].toFixed(1);
  });
  return docs;
});
foodSchema.post("aggregate", function (docs) {
  docs.forEach((doc) => {
    doc["rating"] = doc["rating"].toFixed(1);
  });
  return docs;
});

//Export the model
module.exports = model(DOCUMENT_NAME, foodSchema);
