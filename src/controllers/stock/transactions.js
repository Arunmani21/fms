const { StatusCodes } = require("http-status-codes");
const { BadRequestError } = require("../../errors");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const Transaction = require("../../models/Transaction");

// Deposit Controller
const deposit = async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    throw new BadRequestError("Invalid amount. Must be greater than zero.");
  }

  const accessToken = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET);
  const userId = decodedToken.userId;

  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new BadRequestError("User not found");
    }

    user.balance += amount;
    await user.save();

    const transaction = new Transaction({
      user: userId,
      asset: null,
      amount: 0,
      price: 0,
      type: "deposit",
      remainingBalance: user.balance,
    });
    await transaction.save();

    res
      .status(StatusCodes.CREATED)
      .json({ message: "Deposit successful", transaction });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

// Withdrawal Controller
const withdrawal = async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    throw new BadRequestError("Invalid amount. Must be greater than zero.");
  }

  const accessToken = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET);
  const userId = decodedToken.userId;

  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new BadRequestError("User not found");
    }

    if (amount > user.balance) {
      throw new BadRequestError("Insufficient balance");
    }

    user.balance -= amount;
    await user.save();

    const transaction = new Transaction({
      user: userId,
      amount,
      type: "withdrawal",
      remainingBalance: user.balance,
    });
    await transaction.save();

    res
      .status(StatusCodes.CREATED)
      .json({ message: "Withdrawal successful", transaction });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

const getTransaction = async (req, res) => {
  const accessToken = req.headers.authorization?.split(" ")[1];
  const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET);
  const userId = decodedToken.userId;

  try {
    const transactions = await Transaction.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("asset");
    res.status(StatusCodes.OK).json({
      msg: "transactions retrived successfully",
      data: transactions,
    });
  } catch (error) {
    throw new BadRequestError("Failed to retrive transactions" + error.message);
  }
};

module.exports = {
  deposit,
  withdrawal,
  getTransaction,
};
