const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
//name of file+Schema
const userSchema = new mongoose.Schema({
  // name:String,
  name: {
    type: String,
    //
    require: [true, "please enter a name"],
    maxlength: [40, "Name should be of 40 charecters"],
  },
  email: {
    type: String, // v error message
    //
    require: [true, "please provide a email"],
    validate: [validator.isEmail, "Please enter email in correct format"], // mongoose have validate
    unique: true, //mongoose will lookin DB incoming is unique
  },
  password: {
    type: String, // v error message
    //
    require: [true, "please provide a password"],
    minlength: [6, "Password should be of 6 chars"],
    select: false, //by default password was also coming to body and we had to do {user.password=undefined}
  },
  role: {
    type: String,
    default: "user",
  },
  photo: {
    id: {
      type: String,
      required: true,
    },
    secure_url: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "user",
    },
  },
  forgotPasswordToken: String,
  forgotPasswordExpiry: Date,
  created: {
    type: Date,
    default: Date.now,
  },
});

//encrypt password before save:
userSchema.pre("save", async function (next) {
  // ! every time we update the schema bcrypt is running :(
  if (!this.isModified("password")) {
    return next(); // if password not modified keep on doing what you were doing
  }
  this.password = await bcrypt.hash(this.password, 10);
});

//validate the password with passed on user password
userSchema.methods.isValidatedPassword = async function (userSendPassword) {
  return await bcrypt.compare(userSendPassword, this.password);
};

//only putting id in token is recomended

//CREATE and RETURN JWT
userSchema.methods.getJwtToken = function () {
  const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });
  return token; //payload : we cans add more like user.email---etc
};

//generate forget password token
userSchema.methods.getForgotPasswordToken = function () {
  //generate a long and random string
  const forgotToken = crypto.randomBytes(20).toString("hex");

  //getting a hash - make sure to get a hash on backend
  this.forgotPasswordToken = crypto
    .createHash("sha256")
    .update(forgotToken)
    .digest("hex");

  //time of token
  this.forgotPasswordExpiry = Date.now() + 20 * 60 * 1000;

  return forgotToken;
};

//take schema and convert into model
module.exports = mongoose.model("User", userSchema); //User will be convected to user
//and in db represented as its plural (users)
