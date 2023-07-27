const app = require("./app");

app.listen(process.env.PORT, () => {
  console.log(`server is runining on PORT ${process.env.PORT}`);
});
