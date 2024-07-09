const jwt = require("jsonwebtoken");
const Holding = require("../../models/Holding");
const Asset = require("../../models/Asset");
const Transaction = require("../../models/Transaction");

const portfolio = async (req, res) => {
  try {
    // Extract user ID from JWT token
    const accessToken = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET);
    const userId = decodedToken.userId;

    // Retrieve holdings for the user
    const holdings = await Holding.find({ user: userId });

    // Fetch current asset prices
    const assetIds = holdings.map((holding) => holding.asset);
    const assets = await Asset.find({ _id: { $in: assetIds } });

    // Calculate total value of holdings based on current asset prices
    let totalValue = 0;
    holdings.forEach((holding) => {
      const asset = assets.find(
        (asset) => asset._id.toString() === holding.asset.toString()
      );
      if (asset) {
        const currentValue = asset.currentPrice * holding.amount;
        totalValue += currentValue;
      }
    });

    // Calculate total cost from transactions
    const transactions = await Transaction.find({ user: userId });
    let totalCost = 0;
    let totalRevenue = 0;

    transactions.forEach((transaction) => {
      if (transaction.type === "buy") {
        totalCost += transaction.amount * transaction.price;
      } else if (transaction.type === "sell") {
        totalRevenue += transaction.amount * transaction.price;
      }
    });

    // Calculate profit/loss based on current portfolio value and total cost
    const profitLoss = totalValue - totalCost;

    // Determine status: profit, loss, or no change
    let status;
    if (profitLoss > 0) {
      status = "Profit";
    } else if (profitLoss < 0) {
      status = "Loss";
    } else {
      status = "No Change";
    }

    // Respond with the calculated portfolio value, profit/loss, and status
    res
      .status(200)
      .json({
        "Portfolio Value": totalValue,
        "Price Difference": profitLoss,
        Status: status,
      });
  } catch (error) {
    console.error("Error calculating portfolio value:", error);
    res.status(500).json({ error: "Failed to calculate portfolio value" });
  }
};

module.exports = portfolio;
