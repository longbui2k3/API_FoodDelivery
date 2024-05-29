"use strict";
const mongoose = require("mongoose");
const COLLECTION_NAME = "Categories";
const DOCUMENT_NAME = "Category";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: String, default: "" },
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, categorySchema);
