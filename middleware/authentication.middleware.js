const jwt = require("jsonwebtoken");
require("dotenv").config()
const authenticate = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    res.send({ msg: "Please login first" })
  }

  const decoded = jwt.verify(token, process.env.key);
  console.log("\ndecoded in authenticate.js:", decoded)

  if (decoded) {

    req.body.userId = decoded.UserId;
    next()
  } else {
    res.send({ msg: "Please login first" })
  }
};

module.exports = {
  authenticate
};

