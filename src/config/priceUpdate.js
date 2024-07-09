/*
Used Node cron package to update the price feed every 5 min. 
*/

const cron = require("node-cron");
const Asset = require("../models/Asset"); // Adjust the path as needed

// Function to update asset prices
const updateAssetPrices = async () => {
  try {
    const assets = await Asset.find();
    const minChange = -0.005;
    const maxChange = 0.005;

    for (const asset of assets) {
      const changePercent = Math.random() * (maxChange - minChange) + minChange;
      asset.currentPrice = asset.currentPrice * (1 + changePercent);
      await asset.save();
    }

    console.log("Asset prices updated successfully");
  } catch (error) {
    console.error("Error updating asset prices:", error);
  }
};

// Schedule the job to run every two minutes
cron.schedule("*/5 * * * *", updateAssetPrices);

module.exports = { updateAssetPrices };
