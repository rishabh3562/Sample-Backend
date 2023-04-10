const jwt = require("jsonwebtoken");
require("dotenv").config()
const authenticate = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    res.send({ msg: "Please login first" })
  }

  const decoded = jwt.verify(token, process.env.key);
  // console.log("\ndecoded in authenticate.js:", decoded)

  if (decoded) {

    req.body.userId = decoded.UserId;
    next()
  } else {
    res.send({ msg: "Please login first" })
  }
};

const checkApiKey = (req, res, next) => {
  const key = req.query.key;
  // console.log("req.params.key: ", req.params.key)
  // console.log("req.query.key: ", req.query.key)
  // console.log("key in checkAPIKey: ", key)
  if (!key) {
    return res.status(401).json({ error: "Unauthorized: Missing API key" });
  }
  // key.trim();
  // console.log("key", key);
  // console.log("process.env.apikey", process.env.apiKey);
  const isValidApiKey = (key.trim() === (process.env.apiKey.trim()));
  // console.log("isValidApiKey: ", isValidApiKey)
  if (isValidApiKey) {
    next();
  } else {
    return res.status(401).json({ error: "Unauthorized: Invalid API key" });
  }
};

module.exports = {
  authenticate, checkApiKey
};

