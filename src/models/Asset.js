const mongoose = require("mongoose");

const AssetSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    unique: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  iconUrl: {
    type: String,
    required: true,
  },
  lastDayTradedPrice: {
    type: Number,
    required: true,
  },
  currentPrice: {
    type: Number,
    required: true,
  },
  dayTimeSeries: {
    type: Object,
    default: {},
  },
});

const Asset = mongoose.model("Asset", AssetSchema);

module.exports = Asset;
