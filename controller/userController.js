const User = require("../models/user");
const BigPromise = require("../middleware/bigPromise");
const customError = require("../utils/customError");
const cookieToken = require("../utils/cookieToken");
const fileupload = require("express-fileupload");
const cloudinary = require("cloudinary");
const mailHelper = require("../utils/emailHelper");
const crypto = require("crypto");
const CustomError = require("../utils/customError");

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

exports.forgotPassword = BigPromise(async (req, res, next) => {
  // collect email
  const { email } = req.body;

  // find user in database
  const user = await User.findOne({ email });

  // if user not found in database
  if (!user) {
    return next(new CustomError("Email not found as registered", 400));
  }

  //get token from user model methods
  const forgotToken = user.getForgotPasswordToken();

  // save user fields in DB
  await user.save({ validateBeforeSave: false });

  // create a URL
  const myUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${forgotToken}`;

  // craft a message
  const message = `Copy paste this link in your URL and hit enter \n\n ${myUrl}`;

  // attempt to send email
  try {
    await mailHelper({
      email: user.email,
      subject: "IWILLBUY - Password reset email",
      message,
    });

    // json reponse if email is success
    res.status(200).json({
      succes: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    // reset user fields if things goes wrong
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    // send error response
    return next(new customError(error.message, 500));
  }
});

exports.passwordReset = BigPromise(async (req, res, next) => {
  const token = req.params.token;
  const encryptedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex")
    .toString();
  // Find the user by the stored encryptedToken in the database
  const user = await User.findOne({
    forgotPasswordToken: encryptedToken,
    forgotPasswordExpiry: { $gt: Date.now() }, // check if the token is not expired
  });

  if (!user) {
    return next(new customError("user not found"));
  }

  if (req.body.password !== req.body.confirmpassword) {
    return next(new customError("Password and confirm password do not match."));
  }

  // Update the password and reset the forgot tokens
  user.password = req.body.password;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;
  await user.save();

  // Now you can allow the user to either log in or send them a token

  cookieToken(user, res);
});

exports.getLoggedinUserDetails = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    sucess: true,
    user,
  });
});

exports.changePassword = BigPromise(async (req, res, next) => {
  const userId = req.user.id;
  const user = await User.findById(userId).select("+password");

  const isCorrectPassword = await user.isValidatedPassword(
    req.body.oldpassword
  );

  if (!isCorrectPassword) {
    return next(new customError("Password didnot match our records", 400));
  }
  if (req.body.newpassword != req.body.confirmpassword) {
    return next(new customError("passwords mismatch ", 400));
  }
  user.password = req.body.newpassword;
  await user.save();
  cookieToken(user, res);
});

exports.updateUserDetail = BigPromise(async (req, res, next) => {
  const userId = req.user.id;
  const newData = {
    name: req.body.name,
    email: req.body.email,
  };

  if (req.files) {
    const user = User.findById(userId);
    const imageId = user.photo.id;

    //delete photo on cloudinary

    const resp = await cloudinary.v2.uploader.destroy(imageId);

    //now upload the new photo

    const result = await cloudinary.v2.uploader.upload(
      req.files.photo.tempFilePath,
      {
        folder: "users",
        width: 150,
        crop: "scale",
      }
    );

    newData.photo = {
      id: result.public_id,
      secure_url: result.secure_url,
    };
  }

  const user = await User.findByIdAndUpdate(userId, newData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    sucess: true,
  });
});

exports.adminAllUsers = BigPromise(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    sucess: true,
    users,
  });
});

exports.adminGetOneUser = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new customError("no user found", 400));
  }
  res.status(200).json({
    sucess: true,
    user,
  });
});
exports.adminUpdateOneUser = BigPromise(async (req, res, next) => {
  const userId = req.params.id; // we want to update the user whose id is passed
  const newData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };
  const user = await User.findByIdAndUpdate(userId, newData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  if (!user) {
    return next(new customError("user id is not valid", 404));
  }

  res.status(200).json({
    sucess: true,
  });
});

exports.adminDeleteOneUser = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new CustomError("User id is invalid ", 404));
  }

  await User.deleteOne({ _id: req.params.id });

  // await user.remove()   this is also correct
  //delete photo from cloudinary
  const imageId = user.photo.id;
  const resp = await cloudinary.v2.uploader.destroy(imageId);
  res.status(200).json({
    success: true,
  });
});

exports.managerAllUsers = BigPromise(async (req, res, next) => {
  const users = await User.find({ role: "user" });

  res.status(200).json({
    sucess: true,
    users,
  });
});
