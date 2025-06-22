// controllers/userProfileController.js
const UserProfile = require("../models/UserProfile");

const getProfile = async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ email: req.query.email });
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

const updateProfile = async (req, res) => {
  const { email, bio, gender, year, branch, photoURL } = req.body;
  try {
    const updated = await UserProfile.findOneAndUpdate(
      { email },
      { $set: { bio, gender, year, branch, photoURL } },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile" });
  }
};

module.exports = { getProfile, updateProfile };
