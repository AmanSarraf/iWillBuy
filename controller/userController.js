const User = require("../models/user");
const BigPromise = require("../middleware/bigPromise");
const customError = require("../utils/customError");
const cookieToken = require("../utils/cookieToken");
const fileupload = require("express-fileupload");
const cloudinary = require("cloudinary");

exports.signup = BigPromise(async (req, res, next) => {
  let result; //<-- this result holds Id and secure url of image
  if (req.files) {
    let file = req.files.photo;
    result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
      folder: "users",
      width: 150,
      crop: "scale",
    });
  }
  const { name, email, password } = req.body;
  if (name && email && password) {
    res.send("ok");
    console.log(name);
  }
  if (!email || !name || !password) {
    return next(
      new customError("name , email , and password are required", 400)
    );
  }

  //create user according to the schema in mongodb
  const user = await User.create({
    name,
    email,
    password,
    photo: {
      id: result.public_id,
      secure_url: result.secure_url,
    },
  });

  cookieToken(user, res);
});

exports.login = BigPromise(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new customError("please provide email and passowrd", 400));
  }

  const user = await User.findOne({ email }).select("+password");
  console.log(user);

  if (!user) {
    return next(new customError("email or password doesnot match", 401));
  }
  const isPasswordCorrect = await user.isValidatedPassword(password);
  if (!isPasswordCorrect) {
    return next(
      new customError("email or password doesnot match or exist", 401)
    );
  }

  cookieToken(user, res);
  console.log("okay login ");
});

exports.logout = BigPromise(async (req, res, next) => {
  //clear the cookie named token
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    sucess: true,
    message: "Logout Successful",
  });
});
