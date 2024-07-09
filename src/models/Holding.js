const mongoose = require("mongoose");

const HoldingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  asset: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Asset",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  buyPrice: {
    type: Number,
    required: true,
  },
});

HoldingSchema.methods.invested = function () {
  return this.quantity * this.buyPrice;
};

HoldingSchema.methods.getCurrentValue = async function () {
  const Asset = mongoose.model("Asset");
  const asset = await Asset.findById(this.asset);
  if (!asset) {
    throw new Error("Associated stock not found");
  }
  return this.quantity * asset.currentPrice;
};

HoldingSchema.methods.getDayReturn = async function () {
  const Asset = mongoose.model("Asset");
  const asset = await Asset.findById(this.asset);
  if (!asset) {
    throw new Error("Associated stock not found");
  }
  const dayReturn =
    (asset.currentPrice - asset.lastDayTradedPrice) / asset.lastDayTradedPrice;
  return dayReturn.toFixed(2);
};

const Holding = mongoose.model("Holding", HoldingSchema);

module.exports = Holding;
