const express = require("express");
const router = express.Router();
const { 
  blockUser, 
  reportUser, 
  unmatchUser, 
  getBlockedUsers, 
  unblockUser 
} = require("../controllers/userActionsController");

// Block a user
router.post("/block", blockUser);

// Report a user
router.post("/report", reportUser);

// Unmatch a user
router.post("/unmatch", unmatchUser);

// Get blocked users
router.get("/blocked/:userId", getBlockedUsers);

// Unblock a user
router.post("/unblock", unblockUser);

module.exports = router; 