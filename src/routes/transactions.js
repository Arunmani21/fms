const express = require("express");
const router = express.Router();
const {
  deposit,
  withdrawal,
  getTransaction,
} = require("../controllers/stock/transactions");

// Route definitions
router.post("/deposit", deposit);
router.post("/withdraw", withdrawal);
router.get("/history", getTransaction);

module.exports = router;
