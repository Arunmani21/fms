const { StatusCodes } = require("http-status-codes");
const { BadRequestError } = require("../../errors");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const Transaction = require("../../models/Transaction");
const { pagination } = require("../../utils/pagination");

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
    let previousBalance = user.balance;
    let currentBalance = (user.balance += amount);
    await user.save();

    const transaction = new Transaction({
      user: userId,
      asset: null,
      amount: 0,
      price: 0,
      type: "deposit",
      remainingBalance: currentBalance,
    });
    await transaction.save();

    res.status(StatusCodes.CREATED).json({
      "Previous Balance": previousBalance,
      "Current Balance": currentBalance,
      message: "Deposit successful",
      transaction,
    });
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
      type: "withdraw",
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
    // Get page and items from query params, defaulting to page 1 and 5 items per page
    let { page, items } = req.query;
    page = parseInt(page) || 1;
    items = parseInt(items) || 5;

    const { limit, offset } = pagination(page, items);

    const transactions = await Transaction.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .populate("asset");

    res.status(StatusCodes.OK).json({
      msg: "Transactions retrieved successfully",
      data: transactions,
      currentPage: page,
      itemsPerPage: limit,
    });
  } catch (error) {
    throw new BadRequestError(
      "Failed to retrieve transactions: " + error.message
    );
  }
};

module.exports = {
  deposit,
  withdrawal,
  getTransaction,
};
