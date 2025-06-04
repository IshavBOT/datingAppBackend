const mongoose = require("mongoose");

const userProfileSchema = new mongoose.Schema({
  email: String,
  bio: String,
  gender: String,
  year: String,
  branch: String,
  photoURL: String,
  profileCompleted: { type: Boolean, default: true }
});

module.exports = mongoose.model("UserProfile", userProfileSchema);
