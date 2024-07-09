const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  asset: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Asset",
    required: true,
    required: function () {
      return ["buy", "sell"].includes(this.type);
    },
  },
  amount: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    required: function () {
      return ["buy", "sell"].includes(this.type);
    },
  },
  type: {
    type: String,
    enum: ["buy", "sell", "deposit", "withdrawl"],
  },
  date: {
    type: Date,
    default: Date.now,
  },
  remainingBalance: {
    type: Number,
    required: true,
    set: function (value) {
      return parseFloat(value.toFixed(2));
    },
  },
});

const Transaction = mongoose.model("Transaction", TransactionSchema);

module.exports = Transaction;
