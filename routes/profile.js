const express = require("express");
const router = express.Router();
const UserProfile = require("../models/UserProfile");

// ✅ Complete or Update User Profile
router.post("/complete", async (req, res) => {
  try {
    const { email, name, bio, gender, year, branch, photoURL, tags } = req.body;

    if (!email || !name || !bio || !gender || !year || !branch || !photoURL) {
      return res.status(400).json({ error: "Missing fields" });
    }

    let user = await UserProfile.findOne({ email });

    if (user) {
      await UserProfile.updateOne(
        { email },
        {
          name,
          bio,
          gender,
          year,
          branch,
          photoURL,
          tags: tags || [],
          profileCompleted: true,
        }
      );
    } else {
      user = new UserProfile({
        email,
        name,
        bio,
        gender,
        year,
        branch,
        photoURL,
        tags: tags || [],
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

// ✅ Get Profile by Email (for dashboard)
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

// ✅ Get Profiles to Swipe (excluding already swiped/matched)
router.get("/", async (req, res) => {
  try {
    const { userId, branch, year, gender, tags } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const currentUser = await UserProfile.findById(userId);

    if (!currentUser) {
      return res.status(404).json({ error: "Current user not found" });
    }

    const excludedIds = [
      ...currentUser.liked,
      ...currentUser.disliked,
      ...currentUser.matches,
      ...currentUser.blocked,
      currentUser._id,
    ];

    // Build filter object
    const filter = {
      _id: { $nin: excludedIds },
      profileCompleted: true,
    };

    // Add filters if provided
    if (branch) filter.branch = branch;
    if (year) filter.year = year;
    if (gender) filter.gender = gender;
    if (tags && tags.length > 0) {
      filter.tags = { $in: Array.isArray(tags) ? tags : [tags] };
    }

    const profiles = await UserProfile.find(filter);

    res.status(200).json({ profiles });
  } catch (err) {
    console.error("Error fetching profiles:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Handle swipe actions (like/dislike)
router.post("/swipe", async (req, res) => {
  try {
    const { fromUserId, toUserId, action } = req.body;

    if (!fromUserId || !toUserId || !["like", "dislike"].includes(action)) {
      return res.status(400).json({ error: "Invalid swipe input" });
    }

    const fromUser = await UserProfile.findById(fromUserId);
    const toUser = await UserProfile.findById(toUserId);

    if (!fromUser || !toUser) {
      return res.status(404).json({ error: "User(s) not found" });
    }

    if (action === "like") {
      if (toUser.liked.includes(fromUserId)) {
        fromUser.matches.push(toUserId);
        toUser.matches.push(fromUserId);
        await fromUser.save();
        await toUser.save();
        return res.status(200).json({ message: "It's a match!" });
      } else {
        fromUser.liked.push(toUserId);
        await fromUser.save();
        return res.status(200).json({ message: "Liked" });
      }
    } else {
      fromUser.disliked.push(toUserId);
      await fromUser.save();
      return res.status(200).json({ message: "Disliked" });
    }
  } catch (err) {
    console.error("Swipe error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Edit Profile
router.put("/edit", async (req, res) => {
  try {
    const { email, name, bio, gender, year, branch, photoURL, tags } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await UserProfile.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update fields
    user.name = name || user.name;
    user.bio = bio || user.bio;
    user.gender = gender || user.gender;
    user.year = year || user.year;
    user.branch = branch || user.branch;
    user.photoURL = photoURL || user.photoURL;
    user.tags = tags || user.tags;

    await user.save();

    res.status(200).json({ message: "Profile updated", user });
  } catch (err) {
    console.error("Edit profile error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/getById", async (req, res) => {
  try {
    const profile = await UserProfile.findById(req.query.id);
    if (!profile) return res.status(404).json({ error: "Not found" });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
