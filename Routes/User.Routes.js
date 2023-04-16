const express = require("express");
require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { UserModel } = require("../Model/User.model");
const { authenticate, checkApiKey } = require("../middleware/authentication.middleware");
const { removeCharsetUTF8, parseRequestBody, UrlencodedToJson } = require("../middleware/conversion.middleware");
const saltRounds = +process.env.saltRounds;
const UserRoutes = express.Router();
// const validator = require('email-validator');





const validator = require('validator');

async function checkEmailAndUsername(payload) {
  const { email, username } = payload;

  // Validate email
  if (!validator.isEmail(email)) {
    return {
      msg: "Invalid email format",
      error: true,
    };
  }

  const emailExists = await UserModel.findOne({ email });
  const usernameExists = await UserModel.findOne({ username });

  if (emailExists && usernameExists) {
    return {
      msg: "Email and username already registered",
      error: true,
    };
  } else if (emailExists) {
    return {
      msg: "Email already registered",
      error: true,
    };
  } else if (usernameExists) {
    return {
      msg: "Username already registered",
      error: true,
    };
  } else {
    return null;
  }
}

async function loginValidator(payload) {
  const { email, username } = payload;
  const user = await UserModel.findOne({ $or: [{ email }, { username }] });

  if (!email && !username) {
    return {
      msg: "Please provide an email or a username",
      error: true,
    };
  } else if (email && !validator.isEmail(email)) {
    return {
      msg: "Invalid email format",
      error: true,
    };
  } else if (!user) {
    return {
      msg: "User not found",
      error: true,
    };
  } else {
    return null;
  }
}





//signup
UserRoutes.post("/register", checkApiKey, async (req, res) => {
  const payload = req.body;
  console.log("payload:", payload);
  try {
    const errorResponse = await checkEmailAndUsername(payload);
    // const phoneIsValid = validator.isMobilePhone(payload.phone);
    if (errorResponse) {
      return res.status(404).json(errorResponse);
    }
    // else if (!phoneIsValid) {
    //   return res.status(400).json({ msg: 'Invalid phone number', error: true });
    // }
    else {
      bcrypt.hash(payload.password, saltRounds, async (err, hash) => {
        if (err) {
          throw err;
        } else {
          payload.password = hash;
          const user = new UserModel(payload);

          const result = await user.save();
          // console.log(result);

          res.status(200).send({
            msg: "Registration Successfull",
            username: user.username,
            fname: user.fname,
            lname: user.lname,
            email: user.email,
            error: false,
          });
        }
      });
    }
  } catch (error) {
    const r = res.body;
    res.status(400).send({

      msg: "something went wrong",
      response: r,
      error: true,
    });
    // console.log(error);
  }
});

//login
UserRoutes.post("/login", checkApiKey, async (req, res) => {
  const { email, username, password } = req.body;

  // Validate input
  const errorResponse = await loginValidator({ email, username });
  if (errorResponse) {
    return res.status(400).json(errorResponse);
  }

  try {
    // Find user by email or username
    const user = await UserModel.findOne({ $or: [{ email }, { username }] });
    if (!user) {
      return res.status(404).json({ msg: "User not found", error: true });
    }

    // Check password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ msg: "Invalid credentials", error: true });
    }

    // Create token
    const tokenData = {
      vendorId: user._id,
      fname: user.fname,
      lname: user.lname,
      username: user.username,
      email: user.email,
    };
    const token = jwt.sign(tokenData, process.env.key);

    // Return success response with token
    return res.json({
      msg: "Logged in successfully",
      token,
      fname: user.fname,
      lname: user.lname,
      email: user.email,
      username: user.username,
      error: false,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Something went wrong", error: true });
  }
});



//get all users
UserRoutes.get("/", checkApiKey, async (req, res) => {
  // console.log(`iskey in user routes:`, iskey);
  console.log("req.body:", req.body);
  try {
    const product = await UserModel.find();
    res.send({ data: product });
  } catch (error) {
    // console.log("error", error);
    res.status(500).send({
      error: true,
      msg: "something went wrong",
    });
  }
});

//get user by username (example:-user/rishix786)
UserRoutes.get("/:username", checkApiKey, async (req, res) => {
  const username = req.params.username;
  const onlyId = req.query.onlyId;
  console.log("req.body:", req.body);
  try {

    const user = await UserModel.findOne({ username: username });
    if (!user) {
      return res.status(404).send({ msg: "User not found", error: true });
    }
    else if (onlyId) {

      const userId = user._id;
      return res.status(200).json({ msg: userId, error: false });
    }
    else {

      return res.status(200).json({ msg: user, error: false });
    }
  }
  catch (error) {
    // console.log("error", error);
    res.status(500).send({
      error: true,
      msg: "something went wrong",
    });
  }
});


//get user by id
UserRoutes.get("/id/:id", checkApiKey, async (req, res) => {
  const Id = req.params.id;
  console.log("req.body:", req.body);
  try {
    const product = await UserModel.find({ _id: Id });
    res.send({ data: product });
  } catch (error) {
    // console.log("error", error);
    res.status(500).send({
      error: true,
      msg: "something went wrong",
    });
  }
});

//update profile
UserRoutes.patch("/profile", checkApiKey, authenticate, async (req, res) => {
  const payload = req.body;
  const token = req.headers.authorization;
  console.log("req.body:", req.body);
  console.log("token:", token);
  console.log("payload:", payload);
  const decoded = jwt.verify(token, process.env.key);
  console.log("decoded:", decoded);
  // Check if email or username already exists
  const errorResponse = await checkEmailAndUsername(payload);
  if (errorResponse) {
    return res.status(200).json(errorResponse);
  }

  try {
    // const phoneIsValid = validator.isMobilePhone(payload.phone);
    if (!req.body || !decoded.vendorId) {
      return res.status(400).json({ msg: "Invalid user id ", error: true });
    }
    // else if (!phoneIsValid) {
    //   return res.status(400).json({ msg: 'Invalid phone number', error: true });
    // }
    const userObj = payload;
    delete userObj.userId;

    if (userObj.password) {
      // Hash the new password
      const hashedPassword = await bcrypt.hash(userObj.password, 10);
      userObj.password = hashedPassword;
    }

    const user = await UserModel.findByIdAndUpdate(
      { _id: decoded.vendorId },
      userObj,
      { new: true }
    );

    if (!user) {
      return res.status(404).send({ msg: "User not found" });
    }
    // console.log("user in update profile endpoint: ", user);
    return res.status(200).send({ msg: "Updated successfully" });
  } catch (err) {
    // console.log(err);
    return res.status(500).send({ err: "Something went wrong" });
  }
});

//delete user
UserRoutes.delete("/delete", checkApiKey, async (req, res) => {
  const payload = req.body;
  const token = req.headers.authorization;
  const decoded = jwt.verify(token, process.env.key);


  try {
    const delResult = await UserModel.findByIdAndDelete({ _id: decoded.vendorId }, payload);
    // console.log(delResult);
    res.send("Deletion Successful");
  } catch (err) {
    // console.log(err);
    res.send({ msg: "Something went wrong" });
  }
});

module.exports = { UserRoutes };
