const { StatusCodes } = require("http-status-codes");
const {
  BadRequestError,
  NotFoundError,
  UnauthenticatedError,
} = require("../../errors");
const jwt = require("jsonwebtoken");
const Asset = require("../../models/Asset");

const registerAsset = async (req, res) => {
  const { symbol, companyName, iconUrl, lastDayTradedPrice, currentPrice } =
    req.body;
  if (
    !symbol ||
    !companyName ||
    !iconUrl ||
    !lastDayTradedPrice ||
    !currentPrice
  ) {
    throw new BadRequestError("Invalid Request. Missing required feilds");
  }

  try {
    const existingAsset = await Asset.findOne({ symbol });
    if (existingAsset) {
      throw new BadRequestError("Asset already exists");
    }

    const newAsset = new Asset({
      symbol,
      companyName,
      iconUrl,
      lastDayTradedPrice,
      currentPrice,
    });

    await newAsset.save();

    res.status(StatusCodes.CREATED).json({
      msg: "Asset added Successfully",
      data: newAsset,
    });
  } catch (error) {
    throw new BadRequestError("Failed to add asset" + error.message);
  }
};

const getAllAssets = async (req, res) => {
  try {
    const assets = await Asset.find();
    res.status(StatusCodes.OK).json({
      msg: "Asset retrived Successfully",
      data: assets,
    });
  } catch (error) {}
};

module.exports = {
  registerAsset,
  getAllAssets,
};
