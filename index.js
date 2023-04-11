const express = require("express");
const cors = require("cors");
const bodyParser = require('body-parser');

// const app = express();

const { connect } = require("./configs/db");
const { UserRoutes } = require("./Routes/User.Routes");
// const { connect } = require("mongoose");



require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: "*",
  })
);

// app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.send("Welcome");
});
// app.get('*', (req, res) => {
// console,log(res.body);
//   res.status(404).send('Page not found');
// });
app.use("/user", UserRoutes)

app.listen(process.env.port, async () => {

  connect();
  console.log(`Server running at ${process.env.port}`);
});
