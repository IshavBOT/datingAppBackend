const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const http = require("http");
const { Server } = require("socket.io");
const Message = require("./models/Message");
const UserProfile = require("./models/UserProfile");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize express app
const app = express();
app.use(cors());
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // Replace with frontend origin in production
    methods: ["GET", "POST"],
  },
});

// In-memory map of connected users
const users = {}; // { userId: socketId }

io.on("connection", (socket) => {
  console.log("✅ Socket connected:", socket.id);

  // Register user
  socket.on("register", (userId) => {
    users[userId] = socket.id;
    console.log(`🟢 User ${userId} registered with socket ${socket.id}`);
  });

  // Send message to matched user
  socket.on("send_message", async ({ from, to, message }) => {
    // Check if users are matched
    const sender = await UserProfile.findById(from);
    if (!sender || !sender.matches.includes(to)) {
      return; // Not matched, do not send
    }
    // Save message to DB
    const newMsg = await Message.create({ sender: from, receiver: to, message });
    const toSocketId = users[to];
    // Emit to receiver if online
    if (toSocketId) {
      io.to(toSocketId).emit("receive_message", {
        from,
        to,
        message,
        timestamp: newMsg.timestamp,
      });
    }
    // Do NOT emit to sender to avoid double message
    console.log(`📨 Message from ${from} to ${to}: ${message}`);
  });

  socket.on("disconnect", () => {
    // Remove user from socket map
    for (let [userId, socketId] of Object.entries(users)) {
      if (socketId === socket.id) {
        delete users[userId];
        console.log(`❌ User ${userId} disconnected`);
        break;
      }
    }
  });
});

// API Routes
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profile");
const swipeRoutes = require("./routes/swipe");
const matchRoutes = require("./routes/match");
const userActionsRoutes = require("./routes/userActions");

app.use("/api", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/swipe", swipeRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/user-actions", userActionsRoutes);

const messageRoutes = require("./routes/messageRoutes");
app.use("/api/messages", messageRoutes);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
