const mongoose = require("mongoose");
require("dotenv").config();

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // lname: { type: String, default: "user" },
  // phone: { type: String, default: "0000" },
  username: { type: String, default: "user" },
  DOB: {
    type: Date,
    required: true
  }

})

const UserModel = mongoose.model("user", UserSchema);

module.exports = { UserModel };