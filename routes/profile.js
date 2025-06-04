const express = require("express");
const router = express.Router();
const UserProfile = require("../models/UserProfile");

// Complete or Update User Profile
router.post("/complete", async (req, res) => {
  try {
    const { email, bio, gender, year, branch, photoURL } = req.body;

    if (!email || !bio || !gender || !year || !branch || !photoURL) {
      return res.status(400).json({ error: "Missing fields" });
    }

    let user = await UserProfile.findOne({ email });

    if (user) {
      await UserProfile.updateOne(
        { email },
        {
          bio,
          gender,
          year,
          branch,
          photoURL,
          profileCompleted: true,
        }
      );
    } else {
      user = new UserProfile({
        email,
        bio,
        gender,
        year,
        branch,
        photoURL,
        profileCompleted: true,
      });
      await user.save();
    }

    res.status(200).json({ message: "Profile updated" });
  } catch (err) {
    console.error("Error saving profile:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get Profile by Email (for dashboard)
router.get("/get", async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await UserProfile.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
