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
  tags: [{ type: String }], // Array of interests/tags

  liked: [{ type: mongoose.Schema.Types.ObjectId, ref: "UserProfile" }],
  disliked: [{ type: mongoose.Schema.Types.ObjectId, ref: "UserProfile" }],
  matches: [{ type: mongoose.Schema.Types.ObjectId, ref: "UserProfile" }],
  blocked: [{ type: mongoose.Schema.Types.ObjectId, ref: "UserProfile" }], // Users this user has blocked
  reports: [{ 
    reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: "UserProfile" },
    reason: { type: String, required: true },
    description: String,
    timestamp: { type: Date, default: Date.now }
  }]
});

module.exports = mongoose.model("UserProfile", userProfileSchema);
