const express = require("express");
require("dotenv").config();
const app = express();
const morgan = require("morgan"); // for logging
const cookieparser = require("cookie-parser");
const fileupload = require("express-fileupload");
//for swagger documentation
const swaggerui = require("swagger-ui-express");
const YAML = require("yamljs");

const swaggerDocument = YAML.load("./swagger.yaml");
app.use("/api-docs", swaggerui.serve, swaggerui.setup(swaggerDocument));

//temporary check
app.set("view engine", "ejs");
//regular middle wares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//cookie and file middle ware
app.use(cookieparser());
app.use(
  fileupload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

//morgan middleware
app.use(morgan("tiny"));

//import all routes here

const home = require("./routes/home");
const user = require("./routes/user");

//router middlewares

app.use("/api/v1", home); //the momment this hit up , take the controller the home
app.use("/api/v1", user);
app.get("/signuptest", (req, res) => {
  res.render("signuptest");
});
module.exports = app;
