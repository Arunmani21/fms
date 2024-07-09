const express = require("express");
const router = express.Router();
const calculatePortfolioValue = require("../controllers/stock/portfolio");

// Route to calculate portfolio value
router.get("/portfolio", calculatePortfolioValue);

module.exports = router;
