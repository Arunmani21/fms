const express = require("express");
const { registerAsset, getAllAssets } = require("../controllers/stock/stock");
const {
  buyAsset,
  sellAsset,
  getAllHoldings,
} = require("../controllers/stock/holding");
const router = express.Router();

router.post("/register", registerAsset);
router.get("", getAllAssets);
router.post("/buy", buyAsset);
router.post("/sell", sellAsset);
router.get("/holding", getAllHoldings);
module.exports = router;
