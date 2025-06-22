const express = require("express");
const router = express.Router();

const { handleSwipe, getOtherProfiles } = require("../controllers/swipeController");

router.get("/others", getOtherProfiles);
router.post("/swipe", handleSwipe); // <--- new route

module.exports = router;
