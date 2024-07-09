/*Configuration for the mongoDB connection*/

const mongoose = require("mongoose");

const connectDB = (url) => {
  return mongoose.connect(url);
};

module.exports = connectDB;
