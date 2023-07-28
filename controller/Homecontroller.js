const Bigpromise = require("../middleware/bigPromise");

exports.home = Bigpromise((req, res) => {
  res.status(200).json({
    sucess: true,
    message: "Hello Greeting from API",
  });
});

// else if we dont use bigpromise then we need to use try catch
exports.register = async (req, res) => {
  try {
    //const db = await something
    res.status(200).json({
      sucess: true,
      message: "Register Route",
    });
  } catch (error) {
    console.log(error);
  }
};
