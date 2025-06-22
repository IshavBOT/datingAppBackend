const UserProfile = require("../models/UserProfile");

// ✅ Make sure this function is present and exported
exports.getOtherProfiles = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const users = await UserProfile.find({ email: { $ne: email } });
    res.status(200).json({ users });
  } catch (err) {
    console.error("Error getting other profiles:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.handleSwipe = async (req, res) => {
  const { fromUserId, toUserId, action } = req.body;

  try {
    const fromUser = await UserProfile.findById(fromUserId);
    const toUser = await UserProfile.findById(toUserId);

    if (!fromUser || !toUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (action === "like") {
      if (!fromUser.liked.includes(toUserId)) {
        fromUser.liked.push(toUserId);
        await fromUser.save();
      }

      if (toUser.liked.includes(fromUserId)) {
        if (!fromUser.matches.includes(toUserId)) {
          fromUser.matches.push(toUserId);
        }
        if (!toUser.matches.includes(fromUserId)) {
          toUser.matches.push(fromUserId);
        }
        await fromUser.save();
        await toUser.save();

        return res.status(200).json({ message: "It's a match!" });
      }

      return res.status(200).json({ message: "Liked successfully" });
    }

    if (action === "dislike") {
      if (!fromUser.disliked.includes(toUserId)) {
        fromUser.disliked.push(toUserId);
        await fromUser.save();
      }

      return res.status(200).json({ message: "Disliked successfully" });
    }

    return res.status(400).json({ message: "Invalid swipe action" });
  } catch (err) {
    console.error("Swipe error:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};
