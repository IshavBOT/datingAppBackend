const UserProfile = require("../models/UserProfile");
const Message = require("../models/Message");

// Block a user
exports.blockUser = async (req, res) => {
  try {
    const { userId, targetUserId } = req.body;

    if (!userId || !targetUserId) {
      return res.status(400).json({ error: "User ID and target user ID are required" });
    }

    const user = await UserProfile.findById(userId);
    const targetUser = await UserProfile.findById(targetUserId);

    if (!user || !targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if already blocked
    if (user.blocked.includes(targetUserId)) {
      return res.status(400).json({ error: "User is already blocked" });
    }

    // Add to blocked list
    user.blocked.push(targetUserId);
    await user.save();

    // Remove from matches if they were matched
    if (user.matches.includes(targetUserId)) {
      user.matches = user.matches.filter(id => id.toString() !== targetUserId);
      targetUser.matches = targetUser.matches.filter(id => id.toString() !== userId);
      await targetUser.save();
    }

    // Remove from liked/disliked lists
    user.liked = user.liked.filter(id => id.toString() !== targetUserId);
    user.disliked = user.disliked.filter(id => id.toString() !== targetUserId);
    targetUser.liked = targetUser.liked.filter(id => id.toString() !== userId);
    targetUser.disliked = targetUser.disliked.filter(id => id.toString() !== userId);
    
    await user.save();
    await targetUser.save();

    res.status(200).json({ message: "User blocked successfully" });
  } catch (error) {
    console.error("Block user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Report a user
exports.reportUser = async (req, res) => {
  try {
    const { userId, targetUserId, reason, description } = req.body;

    if (!userId || !targetUserId || !reason) {
      return res.status(400).json({ error: "User ID, target user ID, and reason are required" });
    }

    const user = await UserProfile.findById(userId);
    const targetUser = await UserProfile.findById(targetUserId);

    if (!user || !targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if already reported
    const alreadyReported = user.reports.some(report => 
      report.reportedUser.toString() === targetUserId
    );

    if (alreadyReported) {
      return res.status(400).json({ error: "User has already been reported" });
    }

    // Add report
    user.reports.push({
      reportedUser: targetUserId,
      reason,
      description: description || ""
    });

    await user.save();

    res.status(200).json({ message: "User reported successfully" });
  } catch (error) {
    console.error("Report user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Unmatch a user
exports.unmatchUser = async (req, res) => {
  try {
    const { userId, targetUserId } = req.body;

    if (!userId || !targetUserId) {
      return res.status(400).json({ error: "User ID and target user ID are required" });
    }

    const user = await UserProfile.findById(userId);
    const targetUser = await UserProfile.findById(targetUserId);

    if (!user || !targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if they are actually matched
    if (!user.matches.includes(targetUserId)) {
      return res.status(400).json({ error: "Users are not matched" });
    }

    // Remove from matches
    user.matches = user.matches.filter(id => id.toString() !== targetUserId);
    targetUser.matches = targetUser.matches.filter(id => id.toString() !== userId);

    await user.save();
    await targetUser.save();

    // Delete all messages between the users
    await Message.deleteMany({
      $or: [
        { sender: userId, receiver: targetUserId },
        { sender: targetUserId, receiver: userId }
      ]
    });

    res.status(200).json({ message: "Unmatched successfully" });
  } catch (error) {
    console.error("Unmatch user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get blocked users
exports.getBlockedUsers = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const user = await UserProfile.findById(userId).populate("blocked", "name email photoURL");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ blockedUsers: user.blocked });
  } catch (error) {
    console.error("Get blocked users error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Unblock a user
exports.unblockUser = async (req, res) => {
  try {
    const { userId, targetUserId } = req.body;

    if (!userId || !targetUserId) {
      return res.status(400).json({ error: "User ID and target user ID are required" });
    }

    const user = await UserProfile.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Remove from blocked list
    user.blocked = user.blocked.filter(id => id.toString() !== targetUserId);
    await user.save();

    res.status(200).json({ message: "User unblocked successfully" });
  } catch (error) {
    console.error("Unblock user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}; 