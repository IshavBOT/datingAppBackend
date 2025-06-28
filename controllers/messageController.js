const Message = require("../models/Message");

exports.sendMessage = async (req, res) => {
  try {
    const { sender, receiver, message } = req.body;
    const newMessage = await Message.create({ sender, receiver, message });
    res.status(200).json(newMessage);
  } catch (err) {
    console.error("Message send error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { user1, user2 } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 },
      ],
    }).sort("timestamp");

    res.status(200).json(messages);
  } catch (err) {
    console.error("Get messages error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getLastMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const { matchIds } = req.body; // Array of match user IDs

    if (!matchIds || !Array.isArray(matchIds)) {
      return res.status(400).json({ error: "Match IDs array is required" });
    }

    const lastMessages = [];

    for (const matchId of matchIds) {
      const lastMessage = await Message.findOne({
        $or: [
          { sender: userId, receiver: matchId },
          { sender: matchId, receiver: userId },
        ],
      }).sort({ timestamp: -1 }).limit(1);

      if (lastMessage) {
        lastMessages.push({
          matchId,
          lastMessage: lastMessage.message,
          timestamp: lastMessage.timestamp,
          isFromMe: lastMessage.sender.toString() === userId
        });
      }
    }

    res.status(200).json(lastMessages);
  } catch (err) {
    console.error("Get last messages error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
