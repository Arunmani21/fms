const { StatusCodes } = require("http-status-codes");
const {
  BadRequestError,
  NotFoundError,
  UnauthenticatedError,
} = require("../../errors");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const Holding = require("../../models/Holding");
const Asset = require("../../models/Asset");
const Transaction = require("../../models/Transaction");

const buyAsset = async (req, res) => {
  const { asset_id, amount } = req.body;

  if (!asset_id || !amount) {
    throw new BadRequestError("Invalid Rwquest. Missing required fields");
  }
  const accessToken = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET);
  const userId = decodedToken.userId;
  console.log(userId);
  try {
    const asset = await Asset.findById(asset_id);
    const buyPrice = asset.currentPrice;
    const totalPrice = amount * buyPrice;
    const currentUser = await User.findById(userId);
    if (currentUser.balance < totalPrice) {
      throw new BadRequestError("Insufficient Balance");
    }
    currentUser.balance -= totalPrice;
    await currentUser.save();

    const newHolding = new Holding({
      user: userId,
      asset: asset_id,
      amount,
      buyPrice,
    });

    await newHolding.save();

    const transaction = new Transaction({
      user: userId,
      asset: asset_id,
      amount,
      price: buyPrice,
      type: "buy",
      remainingBalance: currentUser.balance,
    });

    await transaction.save();

    res.status(StatusCodes.CREATED).json({
      msg: "Asset bought Succesfully",
      data: newHolding,
      transactionId: transaction._id,
    });
  } catch (error) {
    throw new BadRequestError("Failed to buy Asset " + error.message);
  }
};

const sellAsset = async (req, res) => {
  const { holdingId, amount } = req.body;

  if (!holdingId || !amount) {
    throw new BadRequestError("Invalid Rwquest. Missing required fields");
  }

  try {
    const holding = await Holding.findById(holdingId);
    if (!holding) {
      throw new BadRequestError("Holding not found");
    }

    if (amount > holding.amount) {
      throw new BadRequestError("Invalid Quantity");
    }

    const asset = await Asset.findById(holding.asset._id);

    const sellPrice = amount * asset.currentPrice;
    holding.amount -= amount;
    if (holding.amount <= 0) {
      await Holding.findByIdAndDelete(holdingId);
    } else {
      await holding.save();
    }

    const currentUser = await User.findById(holding.user);
    if (!currentUser) {
      throw new BadRequestError("User not found");
    }
    currentUser.balance += sellPrice;
    await currentUser.save();

    const transaction = new Transaction({
      user: holding.user,
      asset: holding.asset,
      amount,
      price: asset.currentPrice,
      type: "sell",
      remainingBalance: currentUser.balance,
    });
    await transaction.save();

    res.status(StatusCodes.OK).json({
      msg: "Asset sold Succesfully",
      data: { transactionId: transaction._id, sellPrice },
    });
  } catch (error) {
    throw new BadRequestError("Failed to sell  Asset" + error.message);
  }
};

const getAllHoldings = async (req, res) => {
  const accessToken = req.headers.authorization?.split(" ")[1];
  const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET);
  const userId = decodedToken.userId;

  try {
    const holdings = await Holding.find({ user: userId }).populate(
      "user asset"
    );
    res.status(StatusCodes.OK).json({
      msg: "Holdings retrived successfully",
      data: holdings,
    });
  } catch (error) {
    throw new BadRequestError("Failed to retrive holdings" + error.message);
  }
};

module.exports = {
  buyAsset,
  sellAsset,
  getAllHoldings,
};
