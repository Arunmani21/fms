//configs
require("express-async-errors");
require("dotenv").config();

//imports
const express = require("express");
const connectDB = require("./config/connect");
connectDB;
const errorHandler = require("./middleware/errorHandler");
const auth = require("./middleware/authenticate");
const notFound = require("./middleware/not-found");
const authRouter = require("./routes/auth");
const stockRouter = require("./routes/stocks");
const transactionRouter = require("./routes/transactions");
const portfolioRouter = require("./routes/portfolio");

const app = express();

//middlewares
app.use(express.json());

//routes imports
app.use("/auth", authRouter);
app.use("/stocks", auth, stockRouter);
app.use("/transactions", auth, transactionRouter);
app.use("/portfolio", auth, portfolioRouter);

//error handler middlewares
app.use(errorHandler);
app.use(notFound);

//port setup
const port = process.env.PORT || 4000;

//DB connection and server setup
const start = async () => {
  try {
    await connectDB(process.env.MONGODB_URL);
    app.listen(port, () => {
      console.log(`server running on ${port}`);
    });
  } catch (error) {}
};

start();

//pricefeeder setup
require("./config/priceUpdate");
