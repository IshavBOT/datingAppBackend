const express = require("express");
const router = express.Router();
const { sendMessage, getMessages, getLastMessages } = require("../controllers/messageController");

router.post("/send", sendMessage);
router.get("/:user1/:user2", getMessages);
router.post("/last-messages/:userId", getLastMessages);

module.exports = router;
