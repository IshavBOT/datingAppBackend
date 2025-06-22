const mongoose = require("mongoose");

const userProfileSchema = new mongoose.Schema({
  email: String,
  name: String,
  bio: String,
  gender: String,
  year: String,
  branch: String,
  photoURL: String,
  profileCompleted: { type: Boolean, default: true },

  liked: [{ type: mongoose.Schema.Types.ObjectId, ref: "UserProfile" }],
  disliked: [{ type: mongoose.Schema.Types.ObjectId, ref: "UserProfile" }],
  matches: [{ type: mongoose.Schema.Types.ObjectId, ref: "UserProfile" }],
});

module.exports = mongoose.model("UserProfile", userProfileSchema);
