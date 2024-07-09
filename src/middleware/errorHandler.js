const { StatusCodes } = require("http-status-codes");

const errorHandler = (err, req, res, next) => {
  let customError = {
    statuscode: err.statuscode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || "Something went wrong try again later",
  };

  return res.status(customError.statuscode).json({ msg: customError.msg });
};

module.exports = errorHandler;
