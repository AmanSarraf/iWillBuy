const mongoose = require("mongoose");
const validator = require("validator");

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
    validate: [validator.email, "Please enter email in correct format"], // mongoose have validate
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

//take schema and convert into model
module.exports = mongoose.model("User", userSchema); //User will be convected to user
//and in db represented as its plural (users)
