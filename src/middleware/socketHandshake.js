const jwt = require("jsonwebtoken");
const { UnauthenticatedError, NotFoundError } = require("../errors");
const User = require("../models/User");

const authenticateSocketUser = async (socket, next) => {
  try {
    const token = socket.handshake.headers.access_token;
    if (!token) {
      throw new Error("Authentication token not provided");
    }
    const decodedToken = jwt.verify(token, process.env.SOCKET_TOKEN_SECRET);

    if (!decodedToken) {
      throw new UnauthenticatedError("Invalid token");
    }

    const user = await User.findById(decodedToken.userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    socket.user = user;
    next();
  } catch (error) {
    console.log("Socket authentication error");
    next(new Error("Authentication error"));
  }
};

module.exports = authenticateSocketUser;
