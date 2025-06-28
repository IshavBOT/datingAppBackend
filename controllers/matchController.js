const UserProfile = require("../models/UserProfile");

exports.getMatches = async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: "User ID required" });
  }

  try {
    const user = await UserProfile.findById(userId).populate("matches", "-liked -disliked -matches");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Filter out blocked users from matches
    const filteredMatches = user.matches.filter(match => 
      !user.blocked.includes(match._id)
    );

    res.status(200).json({ matches: filteredMatches });
  } catch (err) {
    console.error("Fetch matches error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
