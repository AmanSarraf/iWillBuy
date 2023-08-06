const User = require("../models/user");
const BigPromise = require("../middleware/bigPromise");
const customError = require("../utils/customError");
const jwt = require("jsonwebtoken");

exports.isLoggedIn = BigPromise(async (req, res, next) => {
  const token =
    req.cookies.token ||
    req.header("Authorization").replace("Bearer ", "") ||
    req.body.token;

  if (!token) {
    return next(new customError("Login first to acccess this page ", 401));
  }

  const decoded = await jwt.verify(token, process.env.JWT_SECRET);

  //injecting custome property to req
  req.user = await User.findById(decoded.id);

  next();
});

//moking like array let us have access to in built functions
exports.customRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new customError("you are not allowed to access this resource", 403)
      );
    } //check if after login has a role
    next();
  };
};
