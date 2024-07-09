require("express-async-errors");
require("dotenv").config();

const express = require("express");
const connectDB = require("./config/connect");
connectDB;
const errorHandler = require("./middleware/errorHandler");
const auth = require("./middleware/authenticate");
const notFound = require("./middleware/not-found");
const app = express();

//middlewares
app.use(express.json());

const authRouter = require("./routes/auth");
const stockRouter = require("./routes/stocks");
const transactionRouter = require("./routes/transactions");
const portfolioRouter = require("./routes/portfolio");

app.use("/auth", authRouter);
app.use("/stocks", auth, stockRouter);
app.use("/transactions", auth, transactionRouter);
app.use("/portfolio", auth, portfolioRouter);

app.use(errorHandler);
app.use(notFound);

const port = process.env.PORT || 4000;

const start = async () => {
  try {
    await connectDB(process.env.MONGODB_URL);
    app.listen(port, () => {
      console.log(`server running on ${port}`);
    });
  } catch (error) {}
};

if (process.env.NODE_ENV !== "test") {
  start();
}

start();

require("./config/priceUpdate");
