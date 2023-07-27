const express = require("express");
const router = express.Router();

//const{name_of_controller}= require(controllerjs file)

const { home, register } = require("../controller/Homecontroller");

// const { register } = require("../controller/RegController");

//what happens when someone visit get route : this is where we bring controller
router.route("/").get(home);
router.route("/register").get(register);

module.exports = router;
