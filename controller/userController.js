const User = require("../models/user");
const BigPromise = require("../middleware/bigPromise");
const customError = require("../utils/customError");
const cookieToken = require("../utils/cookieToken");

exports.signup = BigPromise(async (req, res, next) => {
  console.log("post route is running");
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
  });

  // const token = user.getJwtToken();
  // const options = {
  //   expires: new Date(Date.now() + 3 * 20 * 60 * 60 * 1000),
  //   httpOnly: true,
  // };

  // res.status(200).cookie("token", token, options).json({
  //   sucess: true,
  //   token,
  //   user,
  // });
  cookieToken(user, res);
});
