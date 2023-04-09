const express = require("express");
require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { UserModel } = require("../Model/User.model");
const { authenticate, checkApiKey } = require("../middleware/authentication.middleware");

const saltRounds = +process.env.saltRounds;

const UserRoutes = express.Router();

UserRoutes.post("/register", checkApiKey, async (req, res) => {
  const payload = req.body;

  try {
    const emailExists = await UserModel.findOne({ email: payload.email });
    const usernameExists = await UserModel.findOne({ username: payload.username });

    if (emailExists && usernameExists) {
      res.status(200).send({
        msg: "Email and Username already registered",
        error: true,
      });
    } else if (emailExists) {
      res.status(200).send({
        msg: "Email already registered",
        error: true,
      });
    } else if (usernameExists) {
      res.status(200).send({
        msg: "Username already registered",
        error: true,
      });
    } else {
      bcrypt.hash(payload.password, saltRounds, async (err, hash) => {
        if (err) {
          throw err;
        } else {
          payload.password = hash;
          const user = new UserModel(payload);

          const result = await user.save();
          console.log(result);

          res.status(200).send({
            msg: "Registration Success",
            username: user.name,
            email: user.email,
            error: false,
          });
        }
      });
    }
  } catch (error) {
    res.status(400).send({
      msg: "something went wrong while registering user",
      error: error.message,
    });
    console.log(error);
  }
});

UserRoutes.post("/login", checkApiKey, async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);
  try {
    const user = await UserModel.findOne({ email });
    console.log("\n\n\nuser:", user)
    if (user) {
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          throw err;
        } else {
          if (result) {
            const tokenData = {
              vendorId: user._id,
              name: user.name,

              email: user.email,
              // userType: user.userType,
            }
            const handleJwtSignature = (err, token) => {
              if (err) {
                throw err;
              } else {
                res.status(200).send({
                  msg: "logged in successfuly",
                  token,
                  username: user.name,
                  error: false,
                });
              }
            }
            jwt.sign(tokenData, process.env.key, handleJwtSignature);
          } else {
            res.send({ msg: "Invalid credentials", error: true });
          }
        }
      });
    } else {
      res.send({ msg: "User Not found", error: true });
    }
  } catch (error) {
    res
      .status(400)
      .send({ msg: "something went wrong while login user", error });
    console.log(error);
  }
});

UserRoutes.get("/", checkApiKey, async (req, res) => {
  // console.log(`iskey in user routes:`, iskey);

  try {
    const product = await UserModel.find();
    res.send({ data: product });
  } catch (error) {
    console.log("error", error);
    res.status(500).send({
      error: true,
      msg: "something went wrong",
    });
  }
});
UserRoutes.get("/:id", checkApiKey, async (req, res) => {
  const Id = req.params.id;

  try {
    const product = await UserModel.find({ _id: Id });
    res.send({ data: product });
  } catch (error) {
    console.log("error", error);
    res.status(500).send({
      error: true,
      msg: "something went wrong",
    });
  }
});

UserRoutes.patch("/profile", checkApiKey, authenticate, async (req, res) => {
  const payload = req.body;
  const token = req.headers.authorization;
  const decoded = jwt.verify(token, process.env.key);
  // console.log("\n token in patch is :", req.headers.authorization)
  // console.log("\n decoded in patch is :", decoded)
  // console.log("\n payload in patch is :", payload)
  try {
    if (!req.body) {
      res.send({ msg: "User must send something" });
    }
    else {
      const userObj = payload;
      delete userObj.userId;
      const user = await UserModel.findByIdAndUpdate({ _id: decoded.vendorId }, userObj, { new: true });
      console.log("\n UserModel in patch is :", user)

      res.send({ msg: "updated Sucessfully" });
    }
  } catch (err) {
    console.log(err);
    res.send({ err: "Something went wrong" });
  }
});

UserRoutes.delete("/delete", checkApiKey, async (req, res) => {
  const payload = req.body;
  const token = req.headers.authorization;
  const decoded = jwt.verify(token, process.env.key);


  try {
    const delResult = await UserModel.findByIdAndDelete({ _id: decoded.vendorId }, payload);
    console.log(delResult);
    res.send("Deletion Successful");
  } catch (err) {
    console.log(err);
    res.send({ msg: "Something went wrong" });
  }
});

module.exports = { UserRoutes };
