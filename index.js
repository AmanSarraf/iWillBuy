const app = require("./app");
const connectWithDb = require("./config/db");
const cloudinary = require("cloudinary");
require("dotenv").config();

//connect with database
connectWithDb();

//cloudinary conection
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

app.listen(process.env.PORT, () => {
  console.log(`server is runining on PORT ${process.env.PORT}`);
});
