"use strict";
const { Schema, model } = require("mongoose");
const COLLECTION_NAME = "Statistics";
const DOCUMENT_NAME = "Statistic";

const statisticSchema = new Schema(
  {
    number_of_orders: { type: Number, default: 0 },
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

module.exports = model(DOCUMENT_NAME, statisticSchema);
