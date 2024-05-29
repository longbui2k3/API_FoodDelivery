"use strict";
const { Schema, model } = require("mongoose");
const COLLECTION_NAME = "Stores";
const DOCUMENT_NAME = "Store";
const default_image =
  "https://firebasestorage.googleapis.com/v0/b/ddnangcao-project.appspot.com/o/stores%2Fdefault.jpg?alt=media&token=8d584f4b-c462-4d88-84e8-814c4803e410";
const storeSchema = new Schema(
  {
    name: { type: String },
    image: { type: String, default: default_image },
    address: { type: String },
    rating: {
      type: Number,
      min: [1, "Rating must be above or equal 1"],
      max: [5, "Rating must be below or equal 5"],
      default: 1.0,
    },
    time_open: { type: String },
    time_close: { type: String },
    vendor: { type: Schema.Types.ObjectId, ref: "User" },
    longtitude: { type: Number },
    latitude: { type: Number },
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

storeSchema.post("aggregate", function (docs) {
  docs.forEach((doc) => {
    doc["rating"] = doc["rating"].toFixed(1);
  });
  return docs;
});

storeSchema.post("find", function (docs) {
  docs.forEach((doc) => {
    doc["rating"] = doc["rating"].toFixed(1);
  });
  return docs;
});

//Export the model
module.exports = model(DOCUMENT_NAME, storeSchema);
